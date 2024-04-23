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
import moment from "moment";

interface IDownloadReportProps {
  reports: IReports[];
  setOpen: (open: boolean) => void;
}

interface ICurrentPageData extends IReports {
  setOpen: (open: boolean) => void;
}

const DownloadReportButton = ({
  customerId,
  serviceId,
  setOpen,
}: {
  customerId: string;
  serviceId: string;
  setOpen: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  console.log("customerId:", customerId, "serviceId:", serviceId);

  const downloadReport = useCallback(() => {
    axios({
      url: `https://pinaca-0-server.onrender.com/api/auth/reports/download/${customerId}/${serviceId}`,
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
    accessorKey: "customerName",
    header: "Customer Name",
    cell: ({ row }) => <p>{row.getValue("customerName")}</p>,
  },
  {
    accessorKey: "serviceName",
    header: "Service Opted",
    cell: ({ row }) => <p>{row.getValue("serviceName")}</p>,
  },
  {
    accessorKey: "activateOn",
    header: "Start Date",
    cell: ({ row }) => (
      <p>
        {moment(
          row.original.activateOn !== "DD/MM/YYYY"
            ? row.original.activateOn
            : "01/01/2022"
        ).format("l")}
      </p>
    ),
  },
  {
    accessorKey: "action",
    cell: ({ row }) => (
      <DownloadReportButton
        customerId={row.original.customerId}
        serviceId={row.original.serviceId}
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
  console.log("currentPageData", currentPageData);

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
