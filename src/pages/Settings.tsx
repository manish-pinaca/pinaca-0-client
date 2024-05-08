/* eslint-disable @typescript-eslint/no-explicit-any */
import { Admin, Customer, Role } from "@/app/features/auth/authSlice";
import { useCallback, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

const CustomerProfile = ({ user }: { user: Customer }) => {
  return (
    <>
      <div className="flex gap-2">
        <p className="font-medium">Name:</p>
        <p>{user.customerName}</p>
      </div>
      <div className="flex gap-2">
        <p className="font-medium">Email:</p>
        <p>{user.customerEmail}</p>
      </div>
    </>
  );
};

const AdminProfile = ({ user }: { user: Admin }) => {
  return (
    <>
      <div className="flex gap-2">
        <p className="font-medium">Name:</p>
        <p>{user.name}</p>
      </div>
      <div className="flex gap-2">
        <p className="font-medium">Email:</p>
        <p>{user.email}</p>
      </div>
    </>
  );
};

interface IError {
  password?: string;
}

const Settings = () => {
  const userRole = useAppSelector((state) => state.authReducer.role);
  const customer: Customer = useAppSelector(
    (state) => state.authReducer.customer
  );
  const admin: Admin = useAppSelector((state) => state.authReducer.admin);

  const [passwordType, setPasswordType] = useState<string>("password");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<IError>({});

  const togglePasswordType = useCallback(
    () =>
      setPasswordType((passwordType) =>
        passwordType === "password" ? "text" : "password"
      ),
    []
  );

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        description: "Password and confirm password should be the same.",
      });
      return;
    }

    let newErrors = {};

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    ) {
      newErrors = {
        ...newErrors,
        password:
          "Password must be min 8 characters long, and should have least 1 uppercase, 1 lowercase, 1 digit, and 1 special character.",
      };
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      axios({
        url: `http://3.82.11.201:5000/api/auth/changePassword/${userRole}/${
          userRole === Role.Admin ? admin._id : customer._id
        }`,
        method: "PATCH",
        data: { password },
      })
        .then((response: any) => {
          toast({
            variant: "default",
            description: response.data.message,
          });
        })
        .catch((error: any) => {
          toast({
            variant: "destructive",
            description: error.response.data.message,
          });
        })
        .finally(() => {
          setIsLoading(false);
          setPassword("");
          setConfirmPassword("");
        });
    }
  };
  return (
    <div className="bg-white mt-4 ml-4 p-4 w-1/3 rounded-md">
      <form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
        {userRole === Role.Admin ? (
          <AdminProfile user={admin} />
        ) : (
          <CustomerProfile user={customer} />
        )}
        <div className="flex justify-between">
          <p className="font-medium w-1/3">Change Password:</p>
          <div className="w-2/3">
            <div className="relative">
              <Input
                type={passwordType}
                className="border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {passwordType === "password" ? (
                <FaEyeSlash
                  onClick={togglePasswordType}
                  size={18}
                  className="absolute bottom-3 right-3 cursor-pointer"
                />
              ) : (
                <FaEye
                  onClick={togglePasswordType}
                  size={18}
                  className="absolute bottom-3 right-3 cursor-pointer"
                />
              )}
            </div>
            {errors.password && (
              <p className="text-sm italic text-red-500">{errors.password}</p>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <p className="font-medium w-1/3">Confirm Password:</p>
          <div className="w-2/3">
            <div className="relative">
              <Input
                type={passwordType}
                className="border"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordType === "password" ? (
                <FaEyeSlash
                  onClick={togglePasswordType}
                  size={18}
                  className="absolute bottom-3 right-3 cursor-pointer"
                />
              ) : (
                <FaEye
                  onClick={togglePasswordType}
                  size={18}
                  className="absolute bottom-3 right-3 cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
        <div>
          {isLoading ? (
            <LoadingButton />
          ) : (
            <Button type="submit" variant="primary" className="w-full">
              Submit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Settings;
