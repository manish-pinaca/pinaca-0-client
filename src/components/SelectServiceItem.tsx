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
        `https://pinaca-0-server.onrender.com/api/services/get/${serviceId}`
      );
      setService(data);
    };

    fetchService();
  }, [serviceId]);
  return <SelectItem value={serviceId}>{service?.service}</SelectItem>;
};

export default SelectServiceItem;
