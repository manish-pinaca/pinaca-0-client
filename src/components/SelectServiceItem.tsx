import { useEffect, useState } from "react";
import { SelectItem } from "./ui/select";
import axios from "axios";

interface Service {
  _id: string;
  service: string;
}

const SelectServiceItem = ({ serviceId }: { serviceId: string }) => {
  const [service, setService] = useState<Service>();

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await axios.get(
        `http://3.82.11.201:5000/api/services/get/${serviceId}`
      );
      setService(data);
    };

    fetchService();
  }, [serviceId]);
  return (
    <SelectItem value={serviceId} key={serviceId} className="text-sm">
      {service?.service}
    </SelectItem>
  );
};

export default SelectServiceItem;
