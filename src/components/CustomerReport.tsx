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
import LoadingButton from "./LoadingButton";
import { IActiveService } from "@/app/features/customers/customerSlice";

const CustomerReport = () => {
  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );
  const [serviceId, setServiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const customerId = useAppSelector((state) => state.authReducer.customer._id);

  const downloadReport = useCallback(() => {
    setIsLoading(true);
    axios({
      url: `https://pinaca-0-server.onrender.com/api/auth/reports/download/${customerId}/${serviceId}`,
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
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
        setIsLoading(false);
      });
  }, [customerId, serviceId]);
  return (
    <div className="w-[28%] bg-white p-8 rounded-sm flex flex-col gap-4">
      <p className="text-xl font-medium">Generate Report</p>
      <hr className="border border-gray-200" />
      <div className="flex flex-col justify-between gap-3 h-full">
        <Select onValueChange={setServiceId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Service" />
          </SelectTrigger>
          <SelectContent>
            {activeServices && activeServices?.length > 0 ? (
              activeServices.map((service: IActiveService) => (
                <SelectItem key={service.serviceId} value={service.serviceId}>
                  {service.serviceName}
                </SelectItem>
              ))
            ) : (
              <p>You don't have any active service.</p>
            )}
          </SelectContent>
        </Select>
        {isLoading ? (
          <LoadingButton />
        ) : (
          <Button
            className="w-full"
            variant={"primary"}
            onClick={downloadReport}
            disabled={isLoading}
          >
            Generate Report
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomerReport;
