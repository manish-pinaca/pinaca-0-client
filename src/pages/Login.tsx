/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import React, { useCallback, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import validator from "validator";
import { login } from "@/app/features/auth/authSlice";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import LoadingButton from "@/components/LoadingButton";

interface IError {
  email?: string;
  password?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.authReducer.isLoading);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordType, setPasswordType] = useState<string>("password");
  const [errors, setErrors] = useState<IError>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const togglePasswordType = useCallback(
    () =>
      setPasswordType((passwordType) =>
        passwordType === "password" ? "text" : "password"
      ),
    []
  );

  const handleLogin = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      let newErrors = {};

      if (validator.isEmpty(email) || !validator.isEmail(email)) {
        newErrors = {
          ...newErrors,
          email: "Email is required and must be a valid email address",
        };
      }

      if (
        validator.isEmpty(password) ||
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
        dispatch(
          login({ email, password, role: isAdmin ? "admin" : "customer" })
        )
          .then((res: any) => {
            if (res.error) {
              toast({
                variant: "destructive",
                title: "Login unsuccessful",
                description: res.error.message,
                action: (
                  <ToastAction altText="Try again">Try again</ToastAction>
                ),
              });
            } else {
              toast({
                title: "Login successful!",
                description: res.payload.message,
              });
              navigate("/");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    [email, password, dispatch, navigate, isAdmin]
  );

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="rounded-xl bg-zinc-100 p-12">
        <h1 className="text-3xl font-bold text-zinc-500 text-center">Login</h1>
        <div className="lg:w-96 mt-4 bg-white p-6 rounded-md">
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">
                Email<sup className="text-red-500">*</sup>
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-sm italic text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">
                Password<sup className="text-red-500">*</sup>
              </Label>
              <div className="relative">
                <Input
                  type={passwordType}
                  id="email"
                  placeholder="userId@1234"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <div className="flex w-full max-w-sm items-center justify-between">
              <p>
                Are you logging in as an{" "}
                <span className="font-bold">Admin</span>?
              </p>
              <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              {isLoading ? (
                <LoadingButton />
              ) : (
                <Button type="submit" variant="primary">
                  Login
                </Button>
              )}
            </div>
          </form>
          <p className="mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500">
              Create new account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
