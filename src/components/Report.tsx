/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

import { ICustomer } from "@/app/features/customers/customerSlice";
import { IService } from "@/app/features/services/serviceSlice";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import DownloadReport from "./DownloadReport";

export interface IReports {
  customerId: string;
  serviceId: string;
  customerName: string;
  serviceName: string;
  generatedOn: string;
  awsReportKey?: string;
  filename?: string;
}

const Report = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [reports, setReports] = useState<IReports[]>([]);

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

  const openModal = useCallback(() => {
    if (customerId && serviceId) fetchReports();
    else {
      alert("Please select a customer and service");
      return;
    }
  }, [customerId, serviceId, fetchReports]);

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get(
        "https://pinaca-0-server.onrender.com/api/customer/get/all"
      );
      setCustomers(data.customers);
    } catch (error) {
      console.log("Error fetching customers", error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await axios.get(
        "https://pinaca-0-server.onrender.com/api/services/getAllServices/active"
      );
      setServices(data.services);
    } catch (error) {
      console.log("Error fetching services", error);
    }
  };

  const fetchServicesFilterByCustomerId = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/services/getAllServicesFilterByCustomerId/${customerId}`
      );
      setServices(data.services);
    } catch (error) {
      console.log("Error fetching services", error);
    }
  }, [customerId]);

  const fetchCustomersFilterByServiceId = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/customer/getAllCustomersFilterByServiceId/${serviceId}`
      );
      setCustomers(data.customers);
    } catch (error) {
      console.log("Error fetching customers", error);
    }
  }, [serviceId]);

  useEffect(() => {
    if (serviceId === "" || serviceId === "all") {
      fetchCustomers();
    } else {
      fetchCustomersFilterByServiceId();
    }

    if (customerId === "" || customerId === "all") {
      fetchServices();
    } else {
      fetchServicesFilterByCustomerId();
    }
  }, [
    customerId,
    fetchServicesFilterByCustomerId,
    serviceId,
    fetchCustomersFilterByServiceId,
  ]);
  return (
    <div className="w-[28%] bg-white p-4 rounded-sm flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-xl font-medium">Generate Report</p>
        <hr className="border border-gray-200" />
      </div>
      <div className="flex flex-col justify-between h-full gap-3">
        <div className="flex flex-col gap-3">
          <Select onValueChange={setCustomerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Customer" />
            </SelectTrigger>
            <SelectContent
              className={`${customers.length > 8 ? "h-[280px]" : ""}`}
            >
              {customers.length > 0 ? (
                <>
                  <SelectItem key={"all"} value="all" className="text-xs">
                    All customers
                  </SelectItem>
                  {customers.length > 0 &&
                    customers.map((customer: ICustomer) => {
                      return (
                        <SelectItem
                          key={customer._id}
                          value={customer._id}
                          className="text-xs"
                        >
                          {customer.customerName}
                        </SelectItem>
                      );
                    })}
                </>
              ) : (
                <p className="text-sm p-2">No Customers Found.</p>
              )}
            </SelectContent>
          </Select>
          <Select onValueChange={setServiceId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent
              className={`${services.length > 8 ? "h-[280px]" : ""}`}
            >
              {services.length > 0 ? (
                <>
                  <SelectItem key={"all"} value="all" className="text-xs">
                    All services
                  </SelectItem>
                  {services.length > 0 &&
                    services.map((service: IService) => (
                      <SelectItem
                        key={service._id}
                        value={service._id}
                        className="text-xs"
                      >
                        {service.service}
                      </SelectItem>
                    ))}
                </>
              ) : (
                <p className="p-2 text-sm">No Services Found.</p>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button className="w-full" variant={"primary"} onClick={openModal}>
            Generate Report
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-max max-h-[90vh] overflow-auto">
              <DownloadReport reports={reports} setOpen={setOpen} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Report;
