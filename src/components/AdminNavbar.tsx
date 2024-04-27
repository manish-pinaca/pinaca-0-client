import { IoChevronDown } from "react-icons/io5";
import { IoMdNotificationsOutline, IoIosSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import AccountMenu from "./AccountMenu";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/app/hooks";
import ActionMenu from "./ActionMenu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import axios from "axios";
import moment from "moment";
import { RxCross1 } from "react-icons/rx";
import { useSocketContext } from "@/context/socketTypes";

interface IAdminNavbar {
  setOpenAddCustomerModal: (open: boolean) => void;
  setOpenAddServiceModal: (open: boolean) => void;
  setOpenUploadReportModel: (open: boolean) => void;
}

export interface INotification {
  _id: string;
  message: string;
  type: string;
  createdAt: string;
  sendBy: string;
  sendTo: {
    receiverId: string;
    seen: boolean;
  }[];
}

const AdminNavbar = ({
  setOpenAddCustomerModal,
  setOpenAddServiceModal,
  setOpenUploadReportModel,
}: IAdminNavbar) => {
  const { event } = useSocketContext();
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const userName = useAppSelector((state) => state.authReducer.admin.name);
  const adminId = useAppSelector((state) => state.authReducer.admin._id);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/notifications/get/${adminId}`
      );
      setNotifications(data.notifications);
    } catch (error) {
      console.log("Error fetching notifications", error);
    }
  }, [adminId]);

  const handleMarkedAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await axios.put(
          `https://pinaca-0-server.onrender.com/api/notifications/markAsRed/${notificationId}/${adminId}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        await fetchNotifications();
      } catch (error) {
        console.log("Error Updating notifications", error);
      }
    },
    [adminId, fetchNotifications]
  );

  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((current) => !current);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (event) {
      fetchNotifications();
    }
  }, [fetchNotifications, event]);
  return (
    <>
      <div className="flex py-4 px-12 bg-white justify-between">
        <div className="flex items-center bg-gray-100 relative rounded-md invisible">
          <IoIosSearch className="absolute left-2" />
          <Input
            placeholder="Search..."
            className="bg-inherit outline-none pl-8"
          />
        </div>
        <div className="flex gap-4 items-center justify-end">
          <div
            className="cursor-pointer"
            onClick={() => setShowActionMenu((prev) => !prev)}
          >
            <FaPlus
              className={`w-4 transition ${
                showActionMenu ? "rotate-45" : "rotate-0"
              }`}
            />
            <ActionMenu
              visible={showActionMenu}
              setOpenAddCustomerModal={setOpenAddCustomerModal}
              setOpenAddServiceModal={setOpenAddServiceModal}
              setOpenUploadReportModel={setOpenUploadReportModel}
            />
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => setOpenSheet(true)}
          >
            <IoMdNotificationsOutline size={28} />
            {notifications.length > 0 && (
              <div
                className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
                style={{ transform: "translate(10%, -10%)" }}
              />
            )}
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
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent>
          <SheetHeader className="mb-0.5">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="flex items-center gap-2 py-2 border-b border-gray-200"
                >
                  <div className="">
                    <p className="text-base">{notification.message}</p>
                    <p className="text-sm italic text-blue-500">
                      {moment(notification.createdAt).format("LLL")}
                    </p>
                  </div>
                  <div className="cursor-pointer w-1/4 flex justify-end">
                    <RxCross1
                      onClick={() => handleMarkedAsRead(notification._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[90vh]">
              <p className="italic">
                No notifications to display at the moment.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminNavbar;
