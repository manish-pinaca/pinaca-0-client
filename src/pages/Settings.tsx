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
      <div className="mb-2">
        <label className="block text-gray-700 font-medium">Name</label>
        <input
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="text"
          placeholder="Enter your email address"
          disabled
          value={user.customerName}
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-700 font-medium">Email Address</label>
        <input
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          placeholder="Enter your email address"
          disabled
          value={user.customerEmail}
        />
      </div>
    </>
  );
};

const AdminProfile = ({ user }: { user: Admin }) => {
  return (
    <>
      <div className="mb-2">
        <label className="block text-gray-700 font-medium">Name</label>
        <input
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="text"
          placeholder="Enter your email address"
          disabled
          value={user.name}
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-700 font-medium">Email Address</label>
        <input
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          placeholder="Enter your email address"
          disabled
          value={user.email}
        />
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
      setIsLoading(true);
      
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
    <div className="min-h-[90vh] bg-indigo-50 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-md px-8 pt-4 pb-4 mb-4 max-w-md w-full">
        <h1 className="text-center text-2xl font-bold mb-4">Reset Password</h1>
        <form onSubmit={handleChangePassword}>
          {userRole === Role.Admin ? (
            <AdminProfile user={admin} />
          ) : (
            <CustomerProfile user={customer} />
          )}
          <div className="grid w-full max-w-sm items-center gap-1.5 mb-2">
            <label className="block text-gray-700 font-medium">
              Password<sup className="text-red-500">*</sup>
            </label>
            <div className="relative">
              <Input
                type={passwordType}
                id="password"
                value={password}
                autoComplete="off"
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
          <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
            <label className="block text-gray-700 font-medium">
              Confirm Password<sup className="text-red-500">*</sup>
            </label>
            <div className="relative">
              <Input
                type={passwordType}
                id="password"
                value={confirmPassword}
                autoComplete="off"
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
          <div className="grid w-full max-w-sm items-center gap-1.5">
            {isLoading ? (
              <LoadingButton />
            ) : (
              <Button type="submit" variant="primary">
                Reset Password
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
