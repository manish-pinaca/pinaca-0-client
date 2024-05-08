/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { GrServices } from "react-icons/gr";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";

import {
  IService,
  fetchActiveServiceData,
} from "@/app/features/services/serviceSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Sidebar from "@/components/Sidebar";
import ActiveServices from "@/components/ActiveServices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import History from "./Feedback";
import Settings from "./Settings";
import {
  IActiveService,
  IPendingService,
  IRejectedService,
} from "@/app/features/customers/customerSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useSocketContext } from "@/context/socketTypes";
import ActiveServicesModal from "@/components/ActiveServicesModal";
import PendingServiceRequestModal from "@/components/PendingServiceRequestModal";
import CustomerServices from "@/components/CustomerServices";

export const Status = ({ row }: { row: any }) => {
  console.log(row)
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
        <Badge variant={"success"}>Active</Badge>
      ) : pendingServices.filter(
          (service: IPendingService) =>
            service.serviceId === row.original["_id"]
        ).length > 0 ? (
        <Badge>Pending</Badge>
      ) : rejectedServices.filter(
          (service: IRejectedService) =>
            service.serviceId === row.original["_id"]
        ).length > 0 ? (
        <Badge variant={"destructive"}>Rejected</Badge>
      ) : (
        "-"
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
  }
];

const CustomerDashboard = () => {
  const { event } = useSocketContext();

  const limit = 6;

  const [open, setOpen] = useState<boolean>(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [serviceId, setServiceId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [openUploadReportModel, setOpenUploadReportModel] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const dispatch = useAppDispatch();
  const [active, setActive] = useState<string>("overview");

  const customerId = useAppSelector((state) => state.authReducer.customer._id);
  const customerName = useAppSelector(
    (state) => state.authReducer.customer.customerName
  );

  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );

  const totalServices = useAppSelector(
    (state) => state.serviceReducer.serviceData?.totalServices
  );

  const services = useAppSelector(
    (state) => state.serviceReducer.serviceData?.services
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file);
  };

  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile!);
      formData.append("serviceId", serviceId);
      formData.append(
        "serviceName",
        activeServices.filter((service) => service.serviceId === serviceId)[0]
          .serviceName
      );
      formData.append("generatedOn", format(date!, "yyyy-MM-dd"));

      const { data } = await axios({
        url: `http://3.82.11.201:5000/api/customer/uploadReport/${customerId}`,
        method: "PATCH",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("data", data);

      toast({
        title: data.message,
      });

      setIsLoading(false);
      setOpenUploadReportModel(false);
    } catch (error: any) {
      console.log("Error while uploading", error);
      toast({
        variant: "destructive",
        title: error.response.data.message,
      });
      setIsLoading(false);
      setOpenUploadReportModel(false);
    }
  };

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
    dispatch(fetchActiveServiceData({ page, limit }));
  }, [dispatch, page, customerId]);

  useEffect(() => {
    if (
      event.includes("serviceAdded") ||
      event.includes("serviceStatusChanged")
    ) {
      dispatch(fetchActiveServiceData({ page, limit }));
      dispatch(fetchCustomer(customerId));
    } else if (
      event.includes("accepted-request") ||
      event.includes("rejected-request")
    ) {
      dispatch(fetchCustomer(customerId));
    }
  }, [customerId, dispatch, event, page]);

  useEffect(() => {
    if (!open) {
      setPage(1);
    }
  }, [open]);
  return (
    <>
      <div className="flex bg-indigo-50 h-screen">
        <Sidebar active={active} setActive={setActive} />
        <div className="w-full">
          <CustomerNavbar setOpenUploadReportModel={setOpenUploadReportModel} />
          {active === "history" ? (
            <History />
          ) : active === "settings" ? (
            <Settings />
          ) : (
            <div className="w-11/12 h-[75%] m-auto overflow-auto flex flex-col gap-6 mt-8">
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
                      <p className="text-gray-500 text-sm">
                        {"Total Services"}
                      </p>
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
                <ActiveServicesModal />
                <PendingServiceRequestModal />
              </div>
              <div className="flex flex-wrap justify-between">
                {active === "overview" ? (
                  <ActiveServices />
                ) : active === "services" ? (
                  <CustomerServices />
                ) : null}
                <CustomerReport />
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={openUploadReportModel}
        onOpenChange={setOpenUploadReportModel}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Report</DialogTitle>
            <hr className="border border-gray-200" />
          </DialogHeader>
          <div className="flex gap-2">
            <p>CustomerName:</p>
            <p className="font-medium">{customerName}</p>
          </div>
          <form onSubmit={handleUploadFile}>
            <div className="flex flex-col gap-4">
              <Select onValueChange={setServiceId} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {activeServices && activeServices?.length > 0 ? (
                    activeServices.map((service: IActiveService) => (
                      <SelectItem
                        key={service.serviceId}
                        value={service.serviceId}
                      >
                        {service.serviceName}
                      </SelectItem>
                    ))
                  ) : (
                    <p>You don't have any active service.</p>
                  )}
                </SelectContent>
              </Select>

              <div>
                <Label htmlFor="report">Select Report Generated Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "min-w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      required
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="report">Select Report</Label>
                <Input
                  id="report"
                  type="file"
                  className="w-full"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-sm italic text-red-700 leading-1">
                  Max file size: 10MB
                </p>
              </div>

              {isLoading ? (
                <LoadingButton />
              ) : (
                <Button
                  type="submit"
                  variant={"primary"}
                  // disabled
                  // className="cursor-not-allowed"
                >
                  Upload
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerDashboard;
