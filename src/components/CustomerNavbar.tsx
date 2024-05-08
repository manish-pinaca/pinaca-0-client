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
import axios from "axios";
import { INotification } from "./AdminNavbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import moment from "moment";
import { RxCross1 } from "react-icons/rx";
import { useSocketContext } from "@/context/socketTypes";

interface ICustomerNavbar {
  setOpenUploadReportModel: (open: boolean) => void;
}

const CustomerNavbar = ({ setOpenUploadReportModel }: ICustomerNavbar) => {
  const { event } = useSocketContext();

  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [removeNotification, setRemoveNotification] = useState<string>("");

  const userName = useAppSelector(
    (state) => state.authReducer.customer.customerName
  );

  const customerId = useAppSelector((state) => state.authReducer.customer._id);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `http://3.82.11.201:5000/api/notifications/get/${customerId}`
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
          `http://3.82.11.201:5000/api/notifications/markAsRed/${notificationId}/${customerId}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setRemoveNotification(notificationId);
      } catch (error) {
        console.log("Error Updating notifications", error);
      } finally {
        await fetchNotifications();
        setRemoveNotification("");
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
            <IoMdNotificationsOutline size={32} />
            {notifications.length > 0 && (
              <>
                <span className="sr-only">Notifications</span>
                <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
                  {notifications.length}
                </div>
              </>
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
        <SheetContent className="min-h-screen flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              Notifications
              <span className="inline-flex items-center justify-center w-6 h-6 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                {notifications.length}
              </span>
            </SheetTitle>
          </SheetHeader>
          {notifications.length > 0 ? (
            <div className="overflow-auto">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-center gap-2 py-2 border-b border-gray-200 ${
                    removeNotification === notification._id ? "remove" : ""
                  }`}
                >
                  <div className="">
                    <p className="text-base">{notification.message}</p>
                    <p className="text-sm italic text-blue-500">
                      {moment(notification.createdAt).format("LLL")}
                    </p>
                  </div>
                  <div
                    className="cursor-pointer w-1/4 flex justify-end"
                    onClick={() => handleMarkedAsRead(notification._id)}
                  >
                    <RxCross1 />
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
