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

const Report = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");

  const downloadReport = useCallback(() => {
    axios({
      url: `https://pinaca-0-server.onrender.com/api/reports/download/${customerId}/${serviceId}`,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const file = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = fileURL;
        a.download = "report.pdf";
        a.click();
      })
      .catch((error) => {
        alert(
          error?.response?.status === 400
            ? "Service is not activated"
            : error.message
        );
        console.error("Error downloading PDF:", error);
      });
  }, [customerId, serviceId]);

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
        "https://pinaca-0-server.onrender.com/api/services/get/all"
      );
      setServices(data.services);
    } catch (error) {
      console.log("Error fetching services", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchServices();
  }, []);
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
            <SelectContent className="h-[300px]">
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
            </SelectContent>
          </Select>
          <Select onValueChange={setServiceId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent className="h-[300px]">
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
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button
            className="w-full"
            variant={"primary"}
            onClick={downloadReport}
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Report;
