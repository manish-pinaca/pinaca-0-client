/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { GrServices } from "react-icons/gr";

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
import { IActiveService } from "@/app/features/customers/customerSlice";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export const columns: ColumnDef<IActiveService>[] = [
  {
    accessorKey: "serviceName",
    header: "Service Name",
    cell: ({ row }) => <p>{row.getValue("serviceName")}</p>,
  },
  {
    accessorKey: "activateOn",
    header: "Start Date",
    cell: ({ row }) => (
      <p>{moment(row.getValue("activateOn")).format("DD/MM/YYYY")}</p>
    ),
  },
];

const ActiveServicesModal = () => {
  const limit = 6;
  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [open, setOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [activeServicesData, setActiveServicesData] = useState<
    IActiveService[]
  >([]);

  const table = useReactTable({
    data: activeServicesData,
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

    setActiveServicesData(activeServices?.slice(startIndex, endIndex));
  }, [page, activeServices]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="lg:w-[30%] h-[100px] flex gap-4 items-center rounded-md bg-white p-6 cursor-pointer">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center">
          <GrServices size={24} />
        </div>
        <div>
          <p className="text-4xl text-left font-medium">
            {activeServices.length}
          </p>
          <p className="text-gray-500 text-sm">{"Total Active Services"}</p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-max max-h-[90%] overflow-auto">
        <DialogHeader className="mt-4">
          <div className="flex justify-between">
            <DialogTitle>Active Services</DialogTitle>
            <PaginatedItem
              setPage={setPage}
              limit={limit}
              totalItems={activeServices.length}
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
                  No Active Services.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default ActiveServicesModal;
