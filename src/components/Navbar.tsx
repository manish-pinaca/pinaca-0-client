import { IoChevronDown } from "react-icons/io5";
import { IoMdNotificationsOutline, IoIosSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import AccountMenu from "./AccountMenu";
import { useCallback, useState } from "react";
import { useAppSelector } from "@/app/hooks";
import ActionMenu from "./ActionMenu";

interface INavbarProps {
  setActive: React.Dispatch<React.SetStateAction<string>>;
}

const Navbar = ({ setActive }: INavbarProps) => {
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const userRole = useAppSelector((state) => state.authReducer.role);
  const userName = useAppSelector((state) =>
    userRole === "customer"
      ? state.authReducer.customer.customerName
      : state.authReducer.admin.name
  );

  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((current) => !current);
  }, []);
  return (
    <div className="flex py-4 px-12 bg-white justify-between">
      <div className="flex items-center bg-gray-100 relative rounded-md">
        <IoIosSearch className="absolute left-2" />
        <Input
          placeholder="Search..."
          className="bg-inherit outline-none pl-8"
        />
      </div>
      <div className="flex gap-4 items-center justify-end">
        {userRole === "admin" ? (
          <div
            className="cursor-pointer"
            onClick={() => setShowActionMenu((prev) => !prev)}
          >
            <FaPlus
              className={`w-4 transition ${
                showActionMenu ? "rotate-45" : "rotate-0"
              }`}
            />
            <ActionMenu visible={showActionMenu} setActive={setActive} />
          </div>
        ) : null}
        <div>
          <IoMdNotificationsOutline size={28} />
        </div>
        <div
          className="flex gap-3 items-center cursor-pointer justify-end w-3/4"
          onClick={toggleAccountMenu}
        >
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="text-base font-normal text-center">{userName}</p>
          <IoChevronDown
            className={`w-4 transition ${
              showAccountMenu ? "-rotate-180" : "rotate-0"
            }`}
          />
          <AccountMenu visible={showAccountMenu} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
