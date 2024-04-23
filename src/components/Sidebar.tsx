import { CiSettings } from "react-icons/ci";
import { GrServices } from "react-icons/gr";
import { MdOutlineFeedback } from "react-icons/md";

import logo from "../assets/logo.jpeg";
import { useAppSelector } from "@/app/hooks";

interface SidebarProps {
  active: string;
  setActive: (active: string) => void;
}

const Sidebar = ({ active, setActive }: SidebarProps) => {
  const userRole = useAppSelector((state) => state.authReducer.role);

  return (
    <div className="h-screen w-1/6 bg-white overflow-hidden">
      <div className="flex justify-center items-center h-[20%]">
        <img src={logo} alt="logo" className="w-3/4" />
      </div>
      <div className="flex flex-col justify-center items-center h-[70%] w-full">
        <div
          onClick={() => setActive("overview")}
          className={`flex gap-4 justify-center items-center text-xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "overview" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <p>Overview</p>
        </div>
        <div
          onClick={() => setActive("services")}
          className={`flex gap-4 justify-center items-center text-xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "services" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <GrServices /> Services
        </div>
        {userRole === "admin" ? (
          <div
            onClick={() => setActive("feedback")}
            className={`flex gap-4 justify-center text-xl items-center cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
              active === "feedback" ? "bg-slate-700 text-white" : ""
            }`}
          >
            <MdOutlineFeedback /> Feedback
          </div>
        ) : null}
        <div
          onClick={() => setActive("settings")}
          className={`flex gap-4 justify-center items-center text-xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "settings" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <CiSettings /> Settings
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
