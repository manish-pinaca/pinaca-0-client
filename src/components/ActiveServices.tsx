import { useAppSelector } from "@/app/hooks";
import { useEffect, useState } from "react";
import PaginatedItem from "./PaginatedItem";
import ActiveService from "./ActiveService";

const ActiveServices = () => {
  const limit = 8;
  const [page, setPage] = useState(1);
  const [activeServicesData, setActiveServicesData] = useState<string[]>([]);

  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    setActiveServicesData(activeServices?.slice(startIndex, endIndex));
  }, [page, activeServices]);
  return (
    <div className="w-[70%] bg-white px-8 py-4 rounded-sm flex flex-col gap-4 overflow-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">Active Services</p>
          <PaginatedItem
            setPage={setPage}
            limit={limit}
            totalItems={activeServices?.length}
          />
        </div>
        <hr className="border border-gray-200" />
      </div>
      {activeServicesData?.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-center">There is no active service.</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 overflow-auto">
        {activeServices &&
          activeServicesData?.length > 0 &&
          activeServicesData.map((activeService) => (
            <ActiveService
              key={activeService}
              activeServiceId={activeService}
            />
          ))}
      </div>
    </div>
  );
};

export default ActiveServices;
