import { useEffect, useState } from "react";
import { BiSolidUser } from "react-icons/bi";
import { GrServices } from "react-icons/gr";
import { MdOutlineManageHistory } from "react-icons/md";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ActiveCustomers from "@/components/ActiveCustomers";
import Card from "@/components/Card";
import Navbar from "@/components/Navbar";
import Report from "@/components/Report";
import Sidebar from "@/components/Sidebar";
import Services from "@/components/Services";
import { fetchServiceData } from "@/app/features/services/serviceSlice";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const [active, setActive] = useState<string>("overview");

  const customerData = useAppSelector(
    (state) => state.customerReducer.customerData
  );

  const totalServices = useAppSelector(
    (state) => state.serviceReducer.serviceData?.totalServices
  );

  useEffect(() => {
    dispatch(fetchServiceData({ page: 1, limit: 8 }));
  }, [dispatch]);
  return (
    <div className="flex bg-indigo-50 h-screen">
      <Sidebar active={active} setActive={setActive} />
      <div className="w-full">
        <Navbar />
        <div className="flex flex-wrap px-8 justify-between mt-8">
          <Card
            Icon={BiSolidUser}
            value={Number(customerData?.totalCustomers)}
            label={"Total Customers"}
          />
          <Card
            Icon={GrServices}
            value={Number(totalServices)}
            label="Total Services"
          />
          <Card Icon={MdOutlineManageHistory} value={0} label="New Request" />
        </div>
        <div className="mt-8 px-8 flex flex-wrap gap-6">
          {active === "overview" ? <ActiveCustomers /> : <Services />}
          <Report />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
