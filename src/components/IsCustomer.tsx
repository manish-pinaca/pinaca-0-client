import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

const IsCustomer = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const userRole = useAppSelector((state) => state.authReducer.role);

  useEffect(() => {
    if (userRole !== "customer") navigate("/");
  }, [userRole, navigate]);
  return children;
};

export default IsCustomer;
