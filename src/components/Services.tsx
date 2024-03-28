import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PaginatedItem from "./PaginatedItem";
import {
  IService,
  fetchServiceData,
} from "@/app/features/services/serviceSlice";
import { useEffect, useState } from "react";

const Services = () => {
  const limit = 8;
  const [page, setPage] = useState<number>(1);
  const dispatch = useAppDispatch();

  const serviceData = useAppSelector(
    (state) => state.serviceReducer.serviceData
  );

  const totalServices = useAppSelector(
    (state) => state.serviceReducer.serviceData?.totalServices
  )!;

  useEffect(() => {
    dispatch(fetchServiceData({ page, limit }));
  }, [page, dispatch]);
  return (
    <div className="w-[70%] bg-white p-8 rounded-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xl font-medium">Active Services</p>
        <PaginatedItem
          setPage={setPage}
          limit={limit}
          totalItems={totalServices}
        />
      </div>
      <hr className="border border-gray-200" />
      <div className="grid grid-cols-2 gap-4">
        {serviceData?.services &&
          serviceData.services.length > 0 &&
          serviceData.services.map((service: IService) => (
            <div
              key={service._id}
              className="rounded-md border border-gray-500 p-2"
            >
              <p className="text-xs text-gray-500 leading-none">Service name</p>
              <p className="text-xl leading-normal font-normal">
                {service.service}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Services;
