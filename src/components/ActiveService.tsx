/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";

interface Service {
  _id: string;
  service: string;
}

const ActiveService = ({ activeServiceId }: { activeServiceId: string }) => {
  const [service, setService] = useState<Service>();

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await axios.get(
        `http://localhost:5000/api/services/get/${activeServiceId}`
      );
      setService(data);
    };

    fetchService();
  }, [activeServiceId]);
  return (
    <div className="rounded-md border border-gray-500 p-2">
      <p className="text-xs text-gray-500 leading-none">Service name</p>
      <p className="text-base leading-normal font-normal">{service?.service}</p>
    </div>
  );
};

export default ActiveService;
