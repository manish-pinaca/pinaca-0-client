import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

interface Props {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();

  const token = useAppSelector((state) => state.authReducer.token);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);
  return children;
};

export default PrivateRoute;
