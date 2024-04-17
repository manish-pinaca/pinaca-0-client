import { CiSettings } from "react-icons/ci";
import { GrServices } from "react-icons/gr";
import { BiHistory } from "react-icons/bi";

import logo from "../assets/logo.jpeg";

interface SidebarProps {
  active: string;
  setActive: (active: string) => void;
}

const Sidebar = ({ active, setActive }: SidebarProps) => {
  return (
    <div className="h-screen w-1/6 bg-white overflow-hidden">
      <div className="flex justify-center items-center h-[20%]">
        <img src={logo} alt="logo" className="w-3/4" />
      </div>
      <div className="flex flex-col justify-center items-center h-[70%] w-full">
        <div
          onClick={() => setActive("overview")}
          className={`flex gap-4 justify-center text-xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "overview" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <p>Overview</p>
        </div>
        <div
          onClick={() => setActive("services")}
          className={`flex gap-4 justify-center text-xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "services" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <GrServices /> Services
        </div>
        <div
          onClick={() => setActive("history")}
          className={`flex gap-4 justify-center text-xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "history" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <BiHistory /> History
        </div>
        <div
          onClick={() => setActive("settings")}
          className={`flex gap-4 justify-center text-xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
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
