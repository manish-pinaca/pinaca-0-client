/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import { IService } from "@/app/features/services/serviceSlice";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  IActiveService,
  IPendingService,
  IRejectedService,
} from "@/app/features/customers/customerSlice";
import { toast } from "./ui/use-toast";
import { fetchCustomer } from "@/app/features/auth/authSlice";
import { io } from "socket.io-client";
import { Button } from "./ui/button";
import { Status } from "@/pages/CustomerDashboard";
import { useSocketContext } from "@/context/socketTypes";
import PaginatedItem from "./PaginatedItem";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import axios from "axios";

const socket = io("https://pinaca-0-server.onrender.com");

const OptedOn = ({ row }: { row: any }) => {
  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );

  const pendingServices = useAppSelector(
    (state) => state.authReducer.customer.pendingServices
  );

  const rejectedServices = useAppSelector(
    (state) => state.authReducer.customer.rejectedServices
  );

  return (
    <>
      {activeServices.filter(
        (service: IActiveService) => service.serviceId === row.original["_id"]
      ).length > 0 ? (
        <p>
          {moment(
            activeServices.filter(
              (service) => service.serviceId === row.original["_id"]
            )[0].activateOn
          ).format("DD/MM/YYYY")}
        </p>
      ) : pendingServices.filter(
          (service: IPendingService) =>
            service.serviceId === row.original["_id"]
        ).length > 0 ? (
        <p>
          {moment(
            pendingServices.filter(
              (service) => service.serviceId === row.original["_id"]
            )[0].requestedOn
          ).format("DD/MM/YYYY")}
        </p>
      ) : rejectedServices.filter(
          (service: IRejectedService) =>
            service.serviceId === row.original["_id"]
        ).length > 0 ? (
        <p>
          {moment(
            rejectedServices.filter(
              (service) => service.serviceId === row.original["_id"]
            )[0].rejectedOn
          ).format("DD/MM/YYYY")}
        </p>
      ) : (
        "-"
      )}
    </>
  );
};

const Action = ({ row }: { row: any }) => {
  const dispatch = useAppDispatch();

  const customerId = useAppSelector((state) => state.authReducer.customer._id);
  const adminId = useAppSelector((state) => state.authReducer.customer.adminId);

  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );
  const pendingServices = useAppSelector(
    (state) => state.authReducer.customer.pendingServices
  );
  const rejectedServices = useAppSelector(
    (state) => state.authReducer.customer.rejectedServices
  );

  const addServiceRequest = () => {
    socket.emit(
      "addServiceRequest",
      {
        customerId: customerId,
        serviceId: row.original["_id"],
        adminId,
      },
      (err: any, response: any) => {
        if (err) {
          console.log(err);
        } else {
          console.log(response);
          toast({
            variant: "default",
            title: "Service request sent!",
            description: response.message,
          });
          dispatch(fetchCustomer(customerId));
        }
      }
    );
  };

  return (
    <>
      {activeServices.filter(
        (service: IActiveService) => service.serviceId === row.original["_id"]
      ).length > 0 ? (
        <Button variant="destructive" disabled>
          Deactivate
        </Button>
      ) : pendingServices.filter(
          (service: IPendingService) =>
            service.serviceId === row.original["_id"]
        ).length > 0 ? (
        <Button variant="destructive" disabled>
          Revoke
        </Button>
      ) : (
        <Button
          size={"sm"}
          variant="primary"
          onClick={addServiceRequest}
          disabled={
            rejectedServices.filter(
              (service: IRejectedService) =>
                service.serviceId === row.original["_id"]
            ).length > 0
          }
        >
          Add Service
        </Button>
      )}
    </>
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
    cell: ({ row }) => <Status row={row} />,
  },
  {
    accessorKey: "activateOn",
    header: "Opted On",
    cell: ({ row }) => <OptedOn row={row} />,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <Action row={row} />,
  },
];

const CustomerServices = () => {
  const { event } = useSocketContext();

  const limit = 3;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [totalServices, setTotalServices] = useState<number>(0);
  const [services, setServices] = useState<IService[]>([]);
  const [page, setPage] = useState<number>(1);

  const fetchServices = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/services/getAllServices/active?page=${page}&limit=${limit}`
      );
      setServices(data.services);
      setTotalServices(data.totalServices);
    } catch (error) {
      console.log("Error fetching services", error);
    }
  }, [page]);

  const table = useReactTable({
    data: services,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (
      event.includes("serviceAdded") ||
      event.includes("serviceStatusChanged")
    ) {
      fetchServices();
    }
  }, [event, fetchServices]);

  return (
    <div className="w-[70%] bg-white px-8 py-4 rounded-sm flex flex-col gap-4 overflow-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">Services</p>
          <PaginatedItem
            setPage={setPage}
            limit={limit}
            totalItems={totalServices}
          />
        </div>
        <hr className="border border-gray-200" />
      </div>

      <Table className="border overflow-auto">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No services.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerServices;
