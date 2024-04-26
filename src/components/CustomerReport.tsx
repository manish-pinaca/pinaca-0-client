/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/app/hooks";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { useCallback, useState } from "react";
import axios from "axios";
import { IActiveService } from "@/app/features/customers/customerSlice";
import { IReports } from "./Report";
import { Dialog, DialogContent } from "./ui/dialog";
import DownloadReport from "./DownloadReport";

const CustomerReport = () => {
  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );
  const [serviceId, setServiceId] = useState<string>("");
  const [reports, setReports] = useState<IReports[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const customerId = useAppSelector((state) => state.authReducer.customer._id);

  const fetchReports = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/auth/reports/get/${customerId}/${serviceId}`
      );
      setReports(data);
      setOpen(true);
    } catch (error: any) {
      alert(error?.response?.data?.message);
    }
  }, [customerId, serviceId, setOpen]);

  const handleOpenDownloadReportModal = useCallback(() => {
    if (customerId && serviceId) fetchReports();
    else {
      alert("Please select a customer and service");
      return;
    }
  }, [customerId, serviceId, fetchReports]);

  return (
    <div className="w-[28%] bg-white p-8 rounded-sm flex flex-col gap-4">
      <p className="text-xl font-medium">Generate Report</p>
      <hr className="border border-gray-200" />
      <div className="flex flex-col justify-between gap-3 h-full">
        <Select onValueChange={setServiceId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Service" />
          </SelectTrigger>
          <SelectContent
            className={`${
              activeServices && activeServices.length > 8 ? "h-[280px]" : ""
            }`}
          >
            {activeServices && activeServices?.length > 0 ? (
              <>
                <SelectItem key={"all"} value="all" className="text-xs">
                  All services
                </SelectItem>
                {activeServices.map((service: IActiveService) => (
                  <SelectItem key={service.serviceId} value={service.serviceId}>
                    {service.serviceName}
                  </SelectItem>
                ))}
              </>
            ) : (
              <p className="p-2 text-sm">No Services Found.</p>
            )}
          </SelectContent>
        </Select>
        <Button
          className="w-full"
          variant={"primary"}
          onClick={handleOpenDownloadReportModal}
        >
          Generate Report
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-max max-h-[90vh] overflow-auto">
            <DownloadReport reports={reports} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerReport;
