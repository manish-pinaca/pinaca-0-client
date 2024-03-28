import { CiSettings } from "react-icons/ci";
import { GrServices } from "react-icons/gr";
import { BiHistory } from "react-icons/bi";

interface SidebarProps {
  active: string;
  setActive: (active: string) => void;
}

const Sidebar = ({ active, setActive }: SidebarProps) => {
  
  return (
    <div className="h-screen w-80 bg-white overflow-hidden">
      <p className="text-4xl font-bold pt-6 text-center">LOGO</p>
      <div className="flex flex-col justify-center items-center h-full w-full">
        <div
          onClick={() => setActive("overview")}
          className={`flex gap-4 justify-center text-2xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "overview" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <p>Overview</p>
        </div>
        <div
          onClick={() => setActive("services")}
          className={`flex gap-4 justify-center text-2xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "services" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <GrServices /> Services
        </div>
        <div
          onClick={() => setActive("history")}
          className={`flex gap-4 justify-center text-2xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
            active === "history" ? "bg-slate-700 text-white" : ""
          }`}
        >
          <BiHistory /> History
        </div>
        <div
          onClick={() => setActive("settings")}
          className={`flex gap-4 justify-center text-2xl cursor-pointer hover:bg-slate-700 p-4 w-full hover:text-white ${
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
