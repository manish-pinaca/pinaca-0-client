/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { GrServices } from "react-icons/gr";
import { MdOutlineManageHistory } from "react-icons/md";
import { io } from "socket.io-client";

import {
  IService,
  fetchServiceData,
} from "@/app/features/services/serviceSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Card from "@/components/Card";
import Navbar from "@/components/Navbar";
import Report from "@/components/Report";
import Sidebar from "@/components/Sidebar";
import ActiveServices from "@/components/ActiveServices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginatedItem from "@/components/PaginatedItem";
import { Badge } from "@/components/ui/badge";
import { fetchCustomer } from "@/app/features/auth/authSlice";
import { toast } from "@/components/ui/use-toast";

const socket = io("http://localhost:5000");

const Status = ({ row }: { row: any }) => {
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
      {activeServices.includes(row.original["_id"]) ? (
        <Badge>Active</Badge>
      ) : pendingServices.includes(row.original["_id"]) ? (
        <Badge>Pending</Badge>
      ) : rejectedServices.includes(row.original["_id"]) ? (
        <Badge variant={"destructive"}>Rejected</Badge>
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
      {activeServices.includes(row.original["_id"]) ? (
        <Button variant="destructive">Deactivate</Button>
      ) : pendingServices.includes(row.original["_id"]) ? (
        <Button variant="destructive">Revoke</Button>
      ) : (
        <Button
          variant="primary"
          onClick={addServiceRequest}
          disabled={rejectedServices.includes(row.original["_id"])}
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
    header: "Activate On",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("activateOn") ? row.getValue("activateOn") : "-"}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <Action row={row} />,
  },
];

const CustomerDashboard = () => {
  const limit = 8;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [page, setPage] = useState<number>(1);

  const dispatch = useAppDispatch();
  const [active, setActive] = useState<string>("overview");

  const customerId = useAppSelector((state) => state.authReducer.customer._id);
  const pendingRequests = useAppSelector(
    (state) => state.authReducer.customer.pendingServices
  );

  const totalServices = useAppSelector(
    (state) => state.serviceReducer.serviceData?.totalServices
  );

  const services = useAppSelector(
    (state) => state.serviceReducer.serviceData?.services
  );

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
    dispatch(fetchCustomer(customerId));
    dispatch(fetchServiceData({ page, limit }));
  }, [dispatch, page, customerId]);

  useEffect(() => {
    socket.on("accepted-request", () => {
      dispatch(fetchCustomer(customerId));
    });
  }, [dispatch, customerId]);
  return (
    <div className="flex bg-indigo-50 h-screen">
      <Sidebar active={active} setActive={setActive} />
      <div className="w-full">
        <Navbar />
        <div className="flex flex-wrap px-8 gap-6 mt-8">
          <Dialog>
            <DialogTrigger className="lg:w-[30%] flex gap-4 items-center rounded-md bg-white p-6 cursor-pointer">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex justify-center items-center">
                <GrServices size={32} />
              </div>
              <div>
                <p className="text-5xl text-left">{totalServices}</p>
                <p className="text-gray-500">{"Total Services"}</p>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-max">
              <DialogHeader className="mt-4">
                <div className="flex justify-between">
                  <DialogTitle>Total Services</DialogTitle>
                  <PaginatedItem
                    setPage={setPage}
                    limit={limit}
                    totalItems={totalServices}
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
                            className="text-center lg:text-2xl font-medium"
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
                            className="text-center lg:text-xl"
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
          <Card
            Icon={MdOutlineManageHistory}
            value={pendingRequests.length}
            label="Pending Request"
          />
        </div>
        <div className="mt-8 px-8 flex flex-wrap gap-6">
          <ActiveServices />
          <Report />
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
