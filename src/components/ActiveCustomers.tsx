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

interface Service {
  _id: string;
  service: string;
}

interface ICustomer {
  _id: string;
  customerName: string;
  userEmail: string;
  adminId: string;
  activeService: string;
}

const ActiveService = ({ activeServiceId }: { activeServiceId: string }) => {
  const [service, setService] = useState<Service>();

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await axios.get(
        `http://localhost:5000/api/services/get/${activeServiceId}`
      );
      setService(data);
    };

    fetchService();
  }, [activeServiceId]);

  return <p>{service?.service}</p>;
};

// const ActiveServices = ({ activeServices }: { activeServices: string[] }) => {
//   return activeServices.length > 0 ? (
//     activeServices.map((activeService) => (
//       <ActiveService key={activeService} activeServiceId={activeService} />
//     ))
//   ) : (
//     <p>-</p>
//   );
// };

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
        <ActiveService activeServiceId={row.original.activeService} />
      ) : (
        <p>-</p>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) =>
      row.original.activeService ? <p>dd/mm/yyyy</p> : <p>-</p>,
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

  // const startIndex = (page - 1) * limit;
  // const endIndex = startIndex + limit;

  // const currentPageData = customers.slice(startIndex, endIndex);

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setCurrentPageData(customers.slice(startIndex, endIndex));
  }, [page, customers])

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/customer/get/all/activeCustomers"
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
          <p className="text-xl font-medium">Active Customer</p>
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
