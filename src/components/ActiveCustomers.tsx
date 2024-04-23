/* eslint-disable react-refresh/only-export-components */
import PaginatedItem from "./PaginatedItem";
import { useCallback, useEffect, useState } from "react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { IActiveService } from "@/app/features/customers/customerSlice";
import moment from "moment";

interface ICustomer {
  _id: string;
  customerName: string;
  userEmail: string;
  adminId: string;
  activeService: IActiveService;
}

export const columns: ColumnDef<ICustomer>[] = [
  {
    accessorKey: "customerName",
    header: "Customer Name",
    cell: ({ row }) => (
      <div className="capitalize ">{row.getValue("customerName")}</div>
    ),
  },
  {
    accessorKey: "activeServices",
    header: "Service Opted",
    cell: ({ row }) => {
      return row.original.activeService ? (
        <p>{row.original.activeService.serviceName}</p>
      ) : (
        <p>-</p>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) =>
      row.original.activeService ? (
        <p>
          {moment(
            row.original.activeService.activateOn !== "DD/MM/YYYY"
              ? row.original.activeService.activateOn
              : "01/01/2022"
          ).format("l")}
        </p>
      ) : (
        <p>-</p>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.activeService ? (
        <Badge variant={"success"}>Active</Badge>
      ) : (
        <p>-</p>
      ),
  },
];

const ActiveCustomers = () => {
  const limit = 4;
  const [page, setPage] = useState<number>(1);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [currentPageData, setCurrentPageData] = useState<ICustomer[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setCurrentPageData(customers.slice(startIndex, endIndex));
  }, [page, customers]);

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "https://pinaca-0-server.onrender.com/api/customer/get/all/activeCustomers"
      );

      setCustomers(data.customers);
    } catch (error) {
      console.log("Error fetching customers", error);
    }
  }, []);

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
    fetchCustomers();
  }, [fetchCustomers]);
  return (
    <div className="w-[70%] overflow-auto bg-white px-8 py-4 rounded-sm flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">Customers</p>
          <PaginatedItem
            setPage={setPage}
            totalItems={customers.length}
            limit={limit}
          />
        </div>
        <hr className="border border-gray-200" />
      </div>
      <Table className="border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="text-center lg:text-base font-medium"
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
                  <TableCell key={cell.id} className="text-center lg:text-xs">
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
    </div>
  );
};

export default ActiveCustomers;
