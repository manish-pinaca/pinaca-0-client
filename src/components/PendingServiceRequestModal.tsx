/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { MdOutlineManageHistory } from "react-icons/md";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useAppSelector } from "@/app/hooks";
import PaginatedItem from "./PaginatedItem";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IPendingService } from "@/app/features/customers/customerSlice";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export const columns: ColumnDef<IPendingService>[] = [
  {
    accessorKey: "serviceName",
    header: "Service Name",
    cell: ({ row }) => <p>{row.getValue("serviceName")}</p>,
  },
  {
    accessorKey: "requestedOn",
    header: "Request Date",
    cell: ({ row }) => (
      <p>{moment(row.getValue("requestedOn")).format("DD/MM/YYYY")}</p>
    ),
  },
];

const PendingServiceRequestModal = () => {
  const limit = 6;
  const pendingRequests = useAppSelector(
    (state) => state.authReducer.customer.pendingServices
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [open, setOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pendingServiceData, setPendingServiceData] = useState<
    IPendingService[]
  >([]);

  const table = useReactTable({
    data: pendingServiceData,
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

    setPendingServiceData(pendingRequests?.slice(startIndex, endIndex));
  }, [page, pendingRequests]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="lg:w-[30%] h-[100px] flex gap-4 items-center rounded-md bg-white p-6 cursor-pointer">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center">
          <MdOutlineManageHistory size={24} />
        </div>
        <div>
          <p className="text-4xl text-left font-medium">
            {pendingRequests.length}
          </p>
          <p className="text-gray-500 text-sm">{"Total Pending Services"}</p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-max max-h-[90%] overflow-auto">
        <DialogHeader className="mt-4">
          <div className="flex justify-between">
            <DialogTitle>Pending Services</DialogTitle>
            <PaginatedItem
              setPage={setPage}
              limit={limit}
              totalItems={pendingRequests.length}
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
                      className="text-center lg:text-lg font-medium"
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
                    <TableCell key={cell.id} className="text-center text-sm">
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
                  No Pending Request.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default PendingServiceRequestModal;
