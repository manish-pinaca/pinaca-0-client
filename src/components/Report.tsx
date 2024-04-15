import { ICustomer } from "@/app/features/customers/customerSlice";
import { IService } from "@/app/features/services/serviceSlice";
import { useAppSelector } from "@/app/hooks";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "./ui/button";

const Report = () => {
  const customerData = useAppSelector(
    (state) => state.customerReducer.customerData
  );

  const serviceData = useAppSelector(
    (state) => state.serviceReducer.serviceData
  );
  return (
    <div className="w-[28%] bg-white p-8 rounded-sm flex flex-col gap-4">
      <p className="text-xl font-medium">Generate Report</p>
      <hr className="border border-gray-200" />
      <div className="flex flex-col justify-between h-full gap-3">
        <div className="flex flex-col gap-3">
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Customer" />
            </SelectTrigger>
            <SelectContent>
              {customerData?.customers &&
                customerData?.customers.length > 0 &&
                customerData?.customers.map((customer: ICustomer) => {
                  return (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.customerName}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              {serviceData?.services &&
                serviceData.services.length > 0 &&
                serviceData.services.map((service: IService) => (
                  <SelectItem key={service._id} value={service._id}>
                    {service.service}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button className="w-full" variant={"primary"}>
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Report;
