import React, { ReactNode, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./socketTypes";

const socket = io("https://pinaca-0-server.onrender.com");

interface SocketProviderProps {
  children: ReactNode;
}

let i = 0;

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [event, setEvent] = useState<string>("");

  useEffect(() => {
    socket.on("serviceAdded", () => {
      setEvent(`serviceAdded ${i++}`);
    });

    socket.on("addServiceRequest", () => {
      setEvent(`addServiceRequest ${i++}`);
    });

    socket.on("accepted-request", () => {
      setEvent(`accepted-request ${i++}`);
    });

    socket.on("rejected-request", () => {
      setEvent(`rejected-request ${i++}`);
    });

    socket.on("feedbackReceived", () => {
      setEvent(`feedbackReceived ${i++}`);
    });

    socket.on("serviceAdded", () => {
      setEvent(`serviceAdded ${i++}`);
    });

    socket.on("serviceStatusChanged", () => {
      setEvent(`serviceStatusChanged ${i++}`);
    });
  }, []);

  return (
    <SocketContext.Provider value={{ event }}>
      {children}
    </SocketContext.Provider>
  );
};
