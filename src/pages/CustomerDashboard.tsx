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
import CustomerReport from "@/components/CustomerReport";
import History from "./History";
import Settings from "./Settings";

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
          size={"sm"}
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
  const limit = 6;

  const [open, setOpen] = useState<boolean>(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [page, setPage] = useState<number>(1);

  const dispatch = useAppDispatch();
  const [active, setActive] = useState<string>("overview");

  const customerId = useAppSelector((state) => state.authReducer.customer._id);

  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );

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

  useEffect(() => {
    if (!open) {
      setPage(1);
    }
  }, [open]);
  return (
    <div className="flex bg-indigo-50 h-screen">
      <Sidebar active={active} setActive={setActive} />
      <div className="w-full">
        <Navbar setActive={setActive} />
        {active === "history" ? (
          <History />
        ) : active === "settings" ? (
          <Settings />
        ) : (
          <div className="w-11/12 m-auto h-[75%] overflow-auto flex flex-col gap-6 mt-8">
            <div className="flex flex-wrap justify-between">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger className="lg:w-[30%] h-[100px] flex gap-4 items-center rounded-md bg-white p-6 cursor-pointer">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center">
                    <GrServices size={24} />
                  </div>
                  <div>
                    <p className="text-4xl text-left font-medium">
                      {totalServices}
                    </p>
                    <p className="text-gray-500 text-sm">{"Total Services"}</p>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-max max-h-[90%] overflow-auto">
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
                                className="text-center text-base"
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
                Icon={GrServices}
                value={activeServices?.length}
                label="Active Services"
              />
              <Card
                Icon={MdOutlineManageHistory}
                value={pendingRequests?.length}
                label="Pending Request"
              />
            </div>
            <div className="flex flex-wrap justify-between">
              {active === "overview" ? (
                <ActiveServices />
              ) : active === "services" ? (
                <ActiveServices />
              ) : null}
              <CustomerReport />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
