import { IoChevronDown } from "react-icons/io5";
import { IoMdNotificationsOutline, IoIosSearch } from "react-icons/io";

import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import AccountMenu from "./AccountMenu";
import { useCallback, useState } from "react";

const Navbar = () => {
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);

  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((current) => !current);
  }, []);
  return (
    <div className="flex py-6 px-12 bg-white justify-between">
      <div className="flex items-center bg-gray-100 relative rounded-md">
        <IoIosSearch className="absolute left-2" />
        <Input
          placeholder="Search..."
          className="bg-inherit outline-none pl-8"
        />
      </div>
      <div className="flex gap-4 items-center">
        <div>
          <IoMdNotificationsOutline size={28} />
        </div>
        <div
          className="flex gap-3 items-center cursor-pointer"
          onClick={toggleAccountMenu}
        >
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="text-xl font-normal">User 1</p>
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
