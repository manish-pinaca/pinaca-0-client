/* eslint-disable react-refresh/only-export-components */
import { fetchCustomer } from "@/app/features/auth/authSlice";
import { ICustomer } from "@/app/features/customers/customerSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "./ui/dialog";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import axios from "axios";
import { Button } from "./ui/button";

interface Service {
  _id: string;
  service: string;
}
const ServiceNameCol = ({ serviceId }: { serviceId: string }) => {
  const [service, setService] = useState<Service>();

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/services/get/${serviceId}`
      );
      setService(data);
    };

    fetchService();
  }, [serviceId]);

  return <p>{service?.service}</p>;
};

const DownloadReport = ({ serviceId }: { serviceId: string }) => {
  const customerData = useAppSelector((state) => state.authReducer.customer);
  const downloadReport = useCallback(
    (customerId: string, serviceId: string) => {
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
        })
        .catch((error) => {
          console.error("Error downloading PDF:", error);
        });
    },
    []
  );
  return (
    <Button
      variant={"primary"}
      onClick={() => downloadReport(customerData._id, serviceId)}
    >
      Download Report
    </Button>
  );
};

export const columns: ColumnDef<string>[] = [
  {
    accessorKey: "serviceName",
    header: "Service Name",
    cell: ({ row }) => <ServiceNameCol serviceId={row.original} />,
  },
  {
    accessorKey: "activateOn",
    header: "Activate On",
    cell: () => <p>-</p>,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <DownloadReport serviceId={row.original} />,
  },
];

const ActiveCustomer = ({ customer }: { customer: ICustomer }) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const dispatch = useAppDispatch();

  const customerData = useAppSelector((state) => state.authReducer.customer);

  const fetchCustomerData = useCallback(
    (customerId: string) => {
      dispatch(fetchCustomer(customerId));
    },
    [dispatch]
  );

  const table = useReactTable({
    data: customerData.activeServices ? customerData.activeServices : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  return (
    <Dialog>
      <DialogTrigger>
        <div
          className="rounded-md border border-gray-500 p-2 text-left"
          onClick={() => fetchCustomerData(customer._id)}
        >
          <p className="text-xs text-gray-500 leading-none">Customer name</p>
          <p className="text-md leading-normal font-normal">
            {customer.customerName}
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-max">
        <DialogHeader className="mt-4">
          <DialogTitle>Customer Name: {customerData?.customerName}</DialogTitle>
        </DialogHeader>
        <Table className="border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center lg:text-2xl font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center lg:text-xl">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default ActiveCustomer;
