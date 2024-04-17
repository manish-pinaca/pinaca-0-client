import React from "react";

interface IActionMenuProps {
  visible: boolean;
  setActive: React.Dispatch<React.SetStateAction<string>>;
}

const ActionMenu = ({ visible, setActive }: IActionMenuProps) => {
  if (!visible) return;
  return (
    <div className="bg-black w-48 absolute top-14 right-56 py-3 flex-col gap-2 border-2 border-gray-800 flex rounded-md">
      <div className="px-3 group/item flex flex-row gap-3 items-center w-full">
        <p
          className="text-white text-sm group-hover/item:underline"
          onClick={() => setActive("addCustomer")}
        >
          Add Customer
        </p>
      </div>
      <hr />
      <div className="px-3 group/item flex flex-row gap-3 items-center w-full">
        <p
          className="text-white text-sm group-hover/item:underline"
          onClick={() => setActive("addService")}
        >
          Add Service
        </p>
      </div>
    </div>
  );
};

export default ActionMenu;
