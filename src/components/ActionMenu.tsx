interface IActionMenuProps {
  visible: boolean;
  setOpenAddCustomerModal: (open: boolean) => void;
  setOpenAddServiceModal: (open: boolean) => void;
}

const ActionMenu = ({
  visible,
  setOpenAddCustomerModal,
  setOpenAddServiceModal,
}: IActionMenuProps) => {
  if (!visible) return;
  return (
    <div className="bg-black w-48 absolute top-14 right-56 py-3 flex-col gap-2 border-2 border-gray-800 flex rounded-md">
      <div className="px-3 group/item flex flex-row gap-3 items-center w-full">
        <p
          className="text-white text-sm group-hover/item:underline"
          onClick={() => setOpenAddCustomerModal(true)}
        >
          Add Customer
        </p>
      </div>
      <hr />
      <div className="px-3 group/item flex flex-row gap-3 items-center w-full">
        <p
          className="text-white text-sm group-hover/item:underline"
          onClick={() => setOpenAddServiceModal(true)}
        >
          Add Service
        </p>
      </div>
    </div>
  );
};

export default ActionMenu;
