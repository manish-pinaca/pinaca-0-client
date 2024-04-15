/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { GrServices } from "react-icons/gr";
import { MdOutlineManageHistory } from "react-icons/md";
import { io } from "socket.io-client";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ActiveCustomers from "@/components/ActiveCustomers";
import Card from "@/components/Card";
import Navbar from "@/components/Navbar";
import Report from "@/components/Report";
import Sidebar from "@/components/Sidebar";
import Services from "@/components/Services";
import { fetchServiceData } from "@/app/features/services/serviceSlice";
import { RequestedServices, fetchAdmin } from "@/app/features/auth/authSlice";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PaginatedItem from "@/components/PaginatedItem";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Customers from "@/components/Customers";

const socket = io("http://localhost:5000");

const Accept = ({ row }: { row: any }) => {
  const dispatch = useAppDispatch();
  const adminId = useAppSelector((state) => state.authReducer.admin._id);

  const acceptRequest = () => {
    socket.emit(
      "accept-request",
      {
        customerId: row.original["customerId"],
        serviceId: row.original["serviceId"],
        adminId,
      },
      (err: any, response: any) => {
        if (err) {
          console.log(err);
        } else {
          toast({
            variant: "default",
            title: "Service request accepted!",
            description: response.message,
          });
          dispatch(fetchAdmin(adminId));
        }
      }
    );
  };
  return <Button onClick={acceptRequest}>Accept</Button>;
};

const Reject = ({ row }: { row: any }) => {
  const dispatch = useAppDispatch();
  const adminId = useAppSelector((state) => state.authReducer.admin._id);

  const rejectRequest = () => {
    socket.emit(
      "reject-request",
      {
        customerId: row.original["customerId"],
        serviceId: row.original["serviceId"],
        adminId,
      },
      (err: any, response: any) => {
        if (err) {
          console.log(err);
        } else {
          toast({
            variant: "default",
            title: "Service request rejected!",
            description: response.message,
          });
          dispatch(fetchAdmin(adminId));
        }
      }
    );
  };
  return (
    <Button variant="destructive" onClick={rejectRequest}>
      Reject
    </Button>
  );
};

export const columns: ColumnDef<RequestedServices>[] = [
  {
    accessorKey: "customerName",
    header: "Customer Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("customerName")}</div>
    ),
  },
  {
    accessorKey: "serviceName",
    header: "Service Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("serviceName")}</div>
    ),
  },
  {
    accessorKey: "requestedON",
    header: "Requested On",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("requestedOn") ? row.getValue("requestedOn") : "-"}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Accept row={row} />
        <Reject row={row} />
      </div>
    ),
  },
];

const Dashboard = () => {
  const limit = 8;

  const dispatch = useAppDispatch();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [active, setActive] = useState<string>("overview");
  const [page, setPage] = useState<number>(1);
  const [requestedServicesData, setRequestedServicesData] = useState<
    RequestedServices[]
  >([]);

  const adminId = useAppSelector((state) => state.authReducer.admin._id);

  const totalServices = useAppSelector(
    (state) => state.serviceReducer.serviceData?.totalServices
  );

  const requestedServices = useAppSelector(
    (state) => state.authReducer.admin.requestedServices
  );

  useEffect(() => {
    dispatch(fetchServiceData({ page: 1, limit: 8 }));
  }, [dispatch]);

  useEffect(() => {
    socket.on("addServiceRequest", async () => {
      await dispatch(fetchAdmin(adminId));
    });
  }, [dispatch, adminId]);

  useEffect(() => {
    dispatch(fetchAdmin(adminId));
  }, [dispatch, adminId]);

  const table = useReactTable({
    data: requestedServicesData,
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

    setRequestedServicesData(requestedServices.slice(startIndex, endIndex));
  }, [page, requestedServices]);

  return (
    <div className="flex bg-indigo-50 h-screen">
      <Sidebar active={active} setActive={setActive} />
      <div className="w-full">
        <Navbar />
        <div className="flex flex-wrap px-8 justify-between mt-8">
          <Customers />
          <Card
            Icon={GrServices}
            value={Number(totalServices)}
            label="Total Services"
          />
          <Dialog>
            <DialogTrigger className="lg:w-[30%] flex gap-4 items-center rounded-md bg-white p-6 cursor-pointer">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex justify-center items-center">
                <MdOutlineManageHistory size={32} />
              </div>
              <div>
                <p className="text-5xl text-left">
                  {requestedServices?.length ? requestedServices.length : 0}
                </p>
                <p className="text-gray-500">{"New Request"}</p>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-max">
              <DialogHeader className="mt-4">
                <div className="flex justify-between">
                  <DialogTitle>New Requests</DialogTitle>
                  <PaginatedItem
                    setPage={setPage}
                    limit={limit}
                    totalItems={requestedServices?.length}
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
        </div>
        <div className="mt-8 px-8 flex flex-wrap gap-6">
          {active === "overview" ? <ActiveCustomers /> : <Services />}
          <Report />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
