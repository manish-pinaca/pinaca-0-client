import { createContext, useContext } from "react";

export interface SocketContextType {
  event: string;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};
