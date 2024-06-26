/* eslint-disable react-refresh/only-export-components */
import { BiSolidUser } from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import PaginatedItem from "./PaginatedItem";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import {
  IActiveService,
  ICustomer,
} from "@/app/features/customers/customerSlice";
import { Badge } from "./ui/badge";
import moment from "moment";
import { useSocketContext } from "@/context/socketTypes";

const ActiveService = ({
  activeService,
}: {
  activeService: IActiveService;
}) => {
  return <p>{activeService.serviceName}</p>;
};

const ActiveServices = ({
  activeServices,
}: {
  activeServices: IActiveService[];
}) => {
  return activeServices.length > 0 ? (
    activeServices.map((activeService: IActiveService) => (
      <ActiveService
        key={activeService.serviceId}
        activeService={activeService}
      />
    ))
  ) : (
    <p>-</p>
  );
};

export const columns: ColumnDef<ICustomer>[] = [
  {
    accessorKey: "customerName",
    header: "Customer Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("customerName")}</div>
    ),
  },
  {
    accessorKey: "activeServices",
    header: "Service Opted",
    cell: ({ row }) => {
      return <ActiveServices activeServices={row.original.activeServices} />;
    },
  },
  {
    accessorKey: "activateOn",
    header: "Start Date",
    cell: ({ row }) =>
      row.original.activeServices.length > 0 ? (
        row.original.activeServices.map((activeService: IActiveService) => (
          <p>
            {moment(
              activeService.activateOn !== "DD/MM/YYYY"
                ? activeService.activateOn
                : "01/01/2022"
            ).format("DD/MM/YYYY")}
          </p>
        ))
      ) : (
        <p>-</p>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.activeServices.length > 0 ? (
        row.original.activeServices.map(() => (
          <div>
            <Badge variant={"success"}>Active</Badge>
          </div>
        ))
      ) : (
        <p>-</p>
      ),
  },
];

const Customers = () => {
  const limit = 6;

  const { event } = useSocketContext();

  const [open, setOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  const fetchCustomerData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/customer/get/all?page=${page}&limit=${limit}`
      );
      setTotalCustomers(data.totalCustomers);
      setCustomers(data.customers);
    } catch (error) {
      console.log("Error fetching customer data", error);
    }
  }, [page]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  useEffect(() => {
    if (event.includes("addService")) {
      fetchCustomerData();
    }
  }, [event, fetchCustomerData]);

  useEffect(() => {
    if (!open) {
      setPage(1);
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="lg:w-[30%] h-[80px] flex gap-4 items-center rounded-md bg-white py-2 px-4 cursor-pointer">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center">
          <BiSolidUser size={24} />
        </div>
        <div>
          <p className="text-4xl font-medium text-left">{totalCustomers}</p>
          <p className="text-gray-500 text-sm">{"Total Customers"}</p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-max max-h-[90vh] overflow-auto">
        <DialogHeader className="mt-4">
          <div className="flex justify-between">
            <DialogTitle>Customers</DialogTitle>
            <PaginatedItem
              setPage={setPage}
              limit={limit}
              totalItems={totalCustomers}
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
                    <TableCell
                      key={cell.id}
                      className="text-center lg:text-base"
                    >
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

export default Customers;
