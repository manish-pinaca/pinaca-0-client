import {
  ICustomer,
  fetchCustomerData,
} from "@/app/features/customers/customerSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PaginatedItem from "./PaginatedItem";
import { useEffect, useState } from "react";
import ActiveCustomer from "./ActiveCustomer";

const ActiveCustomers = () => {
  const limit = 8;
  const dispatch = useAppDispatch();
  const [page, setPage] = useState<number>(1);
  const customerData = useAppSelector(
    (state) => state.customerReducer.customerData
  );

  const totalCustomers = useAppSelector(
    (state) => state.customerReducer.customerData?.totalCustomers
  )!;

  useEffect(() => {
    dispatch(fetchCustomerData({ page, limit }));
  }, [dispatch, page]);
  return (
    <div className="w-[70%] overflow-auto bg-white px-8 py-4 rounded-sm flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">Active Customer</p>
          <PaginatedItem
            setPage={setPage}
            totalItems={totalCustomers}
            limit={limit}
          />
        </div>
        <hr className="border border-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-4 overflow-auto">
        {customerData?.customers &&
          customerData?.customers.length > 0 &&
          customerData?.customers.map((customer: ICustomer) => (
            <ActiveCustomer key={customer._id} customer={customer} />
          ))}
      </div>
    </div>
  );
};

export default ActiveCustomers;
