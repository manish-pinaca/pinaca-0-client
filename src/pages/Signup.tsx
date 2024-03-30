/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import React, { useCallback, useState } from "react";
import validator from "validator";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { register } from "@/app/features/auth/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "../components/ui/use-toast";
import { ToastAction } from "../components/ui/toast";

interface IError {
  userName?: string;
  email?: string;
  password?: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.authReducer.isLoading);
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordType, setPasswordType] = useState<string>("password");
  const [errors, setErrors] = useState<IError>({});

  const togglePasswordType = useCallback(
    () =>
      setPasswordType((passwordType) =>
        passwordType === "password" ? "text" : "password"
      ),
    []
  );

  const handleRegister = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      let newErrors = {};

      if (validator.isEmpty(userName)) {
        newErrors = { ...newErrors, userName: "User name is required" };
      }

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
        dispatch(register({ userName, email, password }))
          .then((res: any) => {
            if (res.error) {
              toast({
                variant: "destructive",
                title: "Signup unsuccessful",
                description: res.error.message,
                action: (
                  <ToastAction altText="Try again">Try again</ToastAction>
                ),
              });
            } else {
              toast({
                title: "Sign up successful!",
                description: res.payload.message,
              });
              navigate("/login");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    [userName, email, password, dispatch, navigate]
  );

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="rounded-xl bg-zinc-100 p-12">
        <h1 className="text-3xl font-bold text-zinc-500 text-center">
          Sign Up
        </h1>
        <div className="lg:w-96 mt-4 bg-white p-6 rounded-md">
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">
                User Name<sup className="text-red-500">*</sup>
              </Label>
              <Input
                type="text"
                id="email"
                placeholder="User Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              {errors.userName && (
                <p className="text-sm italic text-red-500">{errors.userName}</p>
              )}
            </div>
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
                  placeholder="userid1234"
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
            <div className="grid w-full max-w-sm items-center gap-1.5">
              {isLoading ? (
                <button
                  disabled
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center justify-center"
                >
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-4 h-4 me-3 text-white animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                  Loading...
                </button>
              ) : (
                <Button type="submit" variant="primary">
                  Sign Up
                </Button>
              )}
            </div>
          </form>
          <p className="mt-4">
            Already have an account{" "}
            <Link to="/login" className="text-blue-500">
              Login here
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
