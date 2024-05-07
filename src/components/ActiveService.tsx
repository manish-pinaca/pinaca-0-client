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
        `http://3.82.11.201:5000/api/services/get/${activeServiceId}`
      );
      setService(data);
    };

    fetchService();
  }, [activeServiceId]);
  return <p>{service?.service}</p>;
};

export default ActiveService;
