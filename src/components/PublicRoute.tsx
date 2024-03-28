import { useAppSelector } from "@/app/hooks";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const PublicRoute: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();

  const token = useAppSelector((state) => state.authReducer.token);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return children;
};

export default PublicRoute;
