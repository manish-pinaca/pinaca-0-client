/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
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
import {
  RequestedServices,
  fetchAdmin,
  register,
} from "@/app/features/auth/authSlice";
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
import Feedback from "./Feedback";
import Settings from "./Settings";
import moment from "moment";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import axios from "axios";
import { ToastAction } from "@/components/ui/toast";

const socket = io("https://pinaca-0-server.onrender.com");

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
  return (
    <Button size={"sm"} onClick={acceptRequest}>
      Accept
    </Button>
  );
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
    <Button size={"sm"} variant="destructive" onClick={rejectRequest}>
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
    accessorKey: "requestedOn",
    header: "Requested On",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("requestedOn")
          ? moment(row.getValue("requestedOn")).format("l")
          : "-"}
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
  const [openAddCustomerModal, setOpenAddCustomerModal] =
    useState<boolean>(false);
  const [openAddServiceModal, setOpenAddServiceModal] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serviceName, setServiceName] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPassword, setCustomerPassword] = useState<string>("");

  const adminId = useAppSelector((state) => state.authReducer.admin._id);

  const totalServices = useAppSelector(
    (state) => state.serviceReducer.serviceData?.totalServices
  );

  const requestedServices = useAppSelector(
    (state) => state.authReducer.admin.requestedServices
  );

  const handleAddCustomer = useCallback(() => {
    setIsLoading(true);
    dispatch(
      register({
        userName: customerName,
        email: customerEmail,
        password: customerPassword,
      })
    )
      .then((res: any) => {
        if (res.error) {
          toast({
            variant: "destructive",
            title: "Customer add failed",
            description: res.error.message,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        } else {
          toast({
            title: "Customer successfully added!",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
        setOpenAddCustomerModal(false);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPassword("");
        window.location.reload();
      });
  }, [customerEmail, customerName, customerPassword, dispatch]);

  const handleAddService = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        "https://pinaca-0-server.onrender.com/api/services/add",
        { service: serviceName }
      );
      toast({
        variant: "default",
        title: "Service added!",
        description: data.message,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.response.data.message,
      });
    } finally {
      setIsLoading(false);
      setOpenAddServiceModal(false);
      setServiceName("");
      dispatch(fetchServiceData({ page: 1, limit: 8 }));
    }
  }, [serviceName, dispatch]);

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
    <>
      <div className="flex bg-indigo-50 h-screen">
        <Sidebar active={active} setActive={setActive} />
        <div className="w-full">
          <Navbar
            setOpenAddCustomerModal={setOpenAddCustomerModal}
            setOpenAddServiceModal={setOpenAddServiceModal}
          />
          {active === "settings" ? (
            <Settings />
          ) : (
            <div className="w-11/12 m-auto overflow-auto flex flex-col gap-4 mt-4">
              <div className="flex flex-wrap justify-between">
                <Customers />
                <Card
                  Icon={GrServices}
                  value={Number(totalServices)}
                  label="Total Services"
                />
                <Dialog>
                  <DialogTrigger className="lg:w-[30%] h-[80px] flex gap-4 items-center rounded-md bg-white py-2 px-4 cursor-pointer">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center">
                      <MdOutlineManageHistory size={24} />
                    </div>
                    <div>
                      <p className="text-4xl text-left font-medium">
                        {requestedServices?.length
                          ? requestedServices.length
                          : 0}
                      </p>
                      <p className="text-gray-500 text-sm">{"New Request"}</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-max max-h-[90vh] overflow-auto">
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
              </div>
              <div className="flex flex-wrap justify-between">
                {active === "overview" ? (
                  <ActiveCustomers />
                ) : active === "services" ? (
                  <Services />
                ) : active === "feedback" ? (
                  <Feedback />
                ) : null}
                <Report />
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={openAddCustomerModal}
        onOpenChange={setOpenAddCustomerModal}
      >
        <DialogContent>
          <DialogTitle>Add Customer</DialogTitle>
          <hr className="border border-gray-200" />
          <form>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="customerName">
                  Customer Name<sup className="text-red-500">*</sup>
                </Label>
                <Input
                  type="text"
                  id="customerName"
                  placeholder="Enter customer name..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="customerEmail">
                  Customer Email<sup className="text-red-500">*</sup>
                </Label>
                <Input
                  type="email"
                  id="customerEmail"
                  placeholder="Enter customer email..."
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="customerPassword">
                  Customer Password<sup className="text-red-500">*</sup>
                </Label>
                <Input
                  type="password"
                  id="customerPassword"
                  placeholder="Set customer password..."
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  required
                />
              </div>
              {isLoading ? (
                <LoadingButton />
              ) : (
                <Button variant={"primary"} onClick={handleAddCustomer}>
                  Add Customer
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={openAddServiceModal} onOpenChange={setOpenAddServiceModal}>
        <DialogContent>
          <DialogTitle>Add Service</DialogTitle>
          <hr className="border border-gray-200" />

          <form>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="serviceName">
                  Service Name<sup className="text-red-500">*</sup>
                </Label>
                <Input
                  type="text"
                  id="serviceName"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                />
              </div>

              {isLoading ? (
                <LoadingButton />
              ) : (
                <Button variant={"primary"} onClick={handleAddService}>
                  Add Service
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
