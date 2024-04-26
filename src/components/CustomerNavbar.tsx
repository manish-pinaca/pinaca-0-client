import { IoChevronDown } from "react-icons/io5";
import { IoMdNotificationsOutline, IoIosSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import AccountMenu from "./AccountMenu";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/app/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { io } from "socket.io-client";
import axios from "axios";
import { INotification } from "./AdminNavbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import moment from "moment";
import { RxCross1 } from "react-icons/rx";

const socket = io("https://pinaca-0-server.onrender.com");

interface ICustomerNavbar {
  setOpenUploadReportModel: (open: boolean) => void;
}

const CustomerNavbar = ({ setOpenUploadReportModel }: ICustomerNavbar) => {
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const userName = useAppSelector(
    (state) => state.authReducer.customer.customerName
  );

  const customerId = useAppSelector((state) => state.authReducer.customer._id);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/notifications/get/${customerId}`
      );
      setNotifications(data.notifications);
    } catch (error) {
      console.log("Error fetching notifications", error);
    }
  }, [customerId]);

  const handleMarkedAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await axios.put(
          `https://pinaca-0-server.onrender.com/api/notifications/markAsRed/${notificationId}/${customerId}`,
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
    [customerId, fetchNotifications]
  );

  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((current) => !current);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    socket.on("serviceAdded", () => {
      fetchNotifications();
    });
  }, [fetchNotifications]);
  return (
    <>
      <div className="flex py-4 px-12 bg-white justify-between">
        <div className="flex items-center bg-gray-100 relative rounded-md">
          <IoIosSearch className="absolute left-2" />
          <Input
            placeholder="Search..."
            className="bg-inherit outline-none pl-8"
          />
        </div>
        <div className="flex gap-4 items-center justify-end">
          <div className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger onClick={() => setOpenUploadReportModel(true)}>
                  <FaPlus className={`w-4 transition`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload Report</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

export default CustomerNavbar;
