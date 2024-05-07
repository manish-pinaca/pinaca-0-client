import PaginatedItem from "./PaginatedItem";
import {
  IService,
  fetchAllServices,
} from "@/app/features/services/serviceSlice";
import { useCallback, useEffect, useState } from "react";
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
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { io } from "socket.io-client";

const socket = io("http://3.82.11.201:5000");

const Status = ({ status }: { status: string }) => {
  return status === "active" ? (
    <Badge variant={"success"}>Active</Badge>
  ) : status === "disabled" ? (
    <Badge variant={"secondary"}>Disabled</Badge>
  ) : (
    <Badge variant={"destructive"}>Removed</Badge>
  );
};

const Action = ({
  serviceId,
  status,
}: {
  serviceId: string;
  status: string;
}) => {
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(
    (state) => state.serviceReducer.allServices.page
  );

  const changeServiceStatus = useCallback(
    async (status: string) => {
      try {
        await axios.patch(
          `http://3.82.11.201:5000/api/services/changeServiceStatus/${serviceId}/${status}`
        );
        socket.emit("changeServiceStatus");
      } catch (error) {
        console.log("Error updating service status", error);
      } finally {
        dispatch(fetchAllServices({ page: currentPage, limit: 4 }));
      }
    },
    [currentPage, dispatch, serviceId]
  );

  return status === "active" ? (
    <Button
      size={"2xs"}
      variant="destructive"
      onClick={() => changeServiceStatus("disabled")}
    >
      Disable
    </Button>
  ) : status === "disabled" ? (
    <div className="flex gap-1 justify-center">
      <Button
        size={"2xs"}
        variant="primary"
        onClick={() => changeServiceStatus("active")}
      >
        Re-Activate
      </Button>
      <Button
        size={"2xs"}
        variant="destructive"
        onClick={() => changeServiceStatus("removed")}
      >
        Remove
      </Button>
    </div>
  ) : (
    <Button
      size={"2xs"}
      variant="primary"
      onClick={() => changeServiceStatus("active")}
    >
      Re-Activate
    </Button>
  );
};

export const columns: ColumnDef<IService>[] = [
  {
    accessorKey: "service",
    header: "Service Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("service")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Status status={row.original.status!} />,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Action serviceId={row.original._id} status={row.original.status!} />
    ),
  },
];

const Services = () => {
  const limit = 4;

  const dispatch = useAppDispatch();

  const [page, setPage] = useState<number>(1);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const allServices = useAppSelector(
    (state) => state.serviceReducer.allServices
  );

  const table = useReactTable({
    data: allServices.services,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  useEffect(() => {
    dispatch(fetchAllServices({ page, limit }));
  }, [page, dispatch]);
  return (
    <div className="w-[70%] overflow-auto bg-white px-8 py-4 rounded-sm flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">Services</p>
          <PaginatedItem
            setPage={setPage}
            limit={limit}
            totalItems={allServices.totalServices}
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

export default Services;
