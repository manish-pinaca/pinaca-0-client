/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { DialogHeader, DialogTitle } from "./ui/dialog";
import PaginatedItem from "./PaginatedItem";
import LoadingButton from "./LoadingButton";
import { IReports } from "./Report";

interface IDownloadReportProps {
  reports: IReports[];
  setOpen: (open: boolean) => void;
}

interface ICurrentPageData extends IReports {
  setOpen: (open: boolean) => void;
}

const CustomerName = ({ customerId }: { customerId: string }) => {
  const [customerName, setCustomerName] = useState<string>("");

  const fetchCustomerName = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/customer/getCustomerName/${customerId}`
      );
      setCustomerName(data.customerName);
    } catch (error) {
      console.log("Error fetching customer", error);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerName();
  }, [fetchCustomerName]);
  return <p>{customerName}</p>;
};

const ServiceName = ({ serviceId }: { serviceId: string }) => {
  const [serviceName, setServiceName] = useState<string>("");

  const fetchServiceName = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/services/get/${serviceId}`
      );
      setServiceName(data.service);
    } catch (error) {
      console.log("Error fetching service", error);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceName();
  }, [fetchServiceName]);

  return <p>{serviceName}</p>;
};

const DownloadReportButton = ({
  customerId,
  serviceId,
  setOpen,
}: ICurrentPageData) => {
  const [loading, setLoading] = useState<boolean>(false);

  const downloadReport = useCallback(() => {
    axios({
      url: `https://pinaca-0-server.onrender.com/api/reports/download/${customerId}/${serviceId}`,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const file = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = fileURL;
        a.download = "report.pdf";
        a.click();
        setLoading(false);
        setOpen(false);
      })
      .catch((error) => {
        alert(
          error?.response?.status === 400
            ? "Service is not activated"
            : error.message
        );
        console.error("Error downloading PDF:", error);
        setLoading(false);
        setOpen(false);
      });
  }, [customerId, serviceId, setOpen]);

  return loading ? (
    <LoadingButton />
  ) : (
    <Button onClick={downloadReport} variant={"primary"} disabled={loading}>
      Download Report
    </Button>
  );
};

export const columns: ColumnDef<ICurrentPageData>[] = [
  {
    accessorKey: "customerId",
    header: "Customer Name",
    cell: ({ row }) => <CustomerName customerId={row.original.customerId} />,
  },
  {
    accessorKey: "serviceId",
    header: "Service Opted",
    cell: ({ row }) => <ServiceName serviceId={row.original.serviceId} />,
  },
  {
    accessorKey: "activateDate",
    header: "Start Date",
    cell: ({ row }) => <p>{row.original.activateDate}</p>,
  },
  {
    accessorKey: "action",
    cell: ({ row }) => (
      <DownloadReportButton
        customerId={row.original.customerId}
        serviceId={row.original.serviceId}
        activateDate={row.original.activateDate}
        setOpen={row.original.setOpen}
      />
    ),
  },
];

const DownloadReport = ({ reports, setOpen }: IDownloadReportProps) => {
  const limit = 6;
  const [page, setPage] = useState<number>(1);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [currentPageData, setCurrentPageData] = useState<ICurrentPageData[]>(
    []
  );

  const table = useReactTable({
    data: currentPageData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setCurrentPageData(
      reports.slice(startIndex, endIndex).map((report) => {
        return { ...report, setOpen };
      })
    );
  }, [page, reports, setOpen]);

  return (
    <>
      <DialogHeader className="mt-4">
        <div className="flex justify-between">
          <DialogTitle>Download Report</DialogTitle>
          <PaginatedItem
            setPage={setPage}
            limit={limit}
            totalItems={reports.length}
          />
        </div>
      </DialogHeader>
      <Table className="border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="text-center lg:text-xl font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center lg:text-base">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default DownloadReport;
