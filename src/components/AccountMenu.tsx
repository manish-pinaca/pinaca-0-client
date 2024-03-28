import { logout } from "@/app/features/auth/authSlice";
import { useAppDispatch } from "@/app/hooks";
import React from "react";

interface IAccountMenuProps {
  visible: boolean;
}

const AccountMenu: React.FC<IAccountMenuProps> = ({ visible }) => {
  const dispatch = useAppDispatch();

  if (!visible) return;
  return (
    <div className="bg-black w-56 absolute top-14 right-5 py-5 flex-col border-2 border-gray-800 flex rounded-md">
      <div className="flex flex-col gap-3">
        <div className="px-3 group/item flex flex-row gap-3 items-center w-full">
          <p className="text-white text-sm group-hover/item:underline">
            User 1
          </p>
        </div>
      </div>
      <hr className="bg-gray-600 border-0 h-px my-4" />
      <div
        onClick={() => dispatch(logout())}
        className="px-3 text-center text-white text-sm hover:underline"
      >
        Log Out
      </div>
    </div>
  );
};

export default AccountMenu;
