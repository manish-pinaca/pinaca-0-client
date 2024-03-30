import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

const IsAdmin = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const userRole = useAppSelector((state) => state.authReducer.role);

  useEffect(() => {
    if (userRole !== "admin") navigate("/");
  }, [userRole, navigate]);
  return children;
};

export default IsAdmin;
