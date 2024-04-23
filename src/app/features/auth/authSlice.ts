/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  IActiveService,
  IPendingService,
  IRejectedService,
} from "../customers/customerSlice";

enum Role {
  Admin = "admin",
  Customer = "customer",
}

export interface Notifications {
  customerName: string;
  serviceName: string;
  action: string;
}

export interface RequestedServices {
  customerId: string;
  customerName: string;
  serviceName: string;
  serviceId: string;
  requestedOn: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  notifications: Notifications[];
  requestedServices: RequestedServices[];
}

export interface Customer {
  _id: string;
  customerName: string;
  customerEmail: string;
  pendingServices: IPendingService[];
  activeServices: IActiveService[];
  rejectedServices: IRejectedService[];
  adminId: string;
}

export interface AuthState {
  isLoading: boolean;
  error: string;
  token: string;
  role: Role;
  customer: Customer;
  admin: Admin;
}

const initialState: AuthState = {
  isLoading: false,
  error: "",
  token: localStorage.getItem("token") || "",
  role: (localStorage.getItem("role") || "customer") as Role,
  customer: JSON.parse(localStorage.getItem("customer") || "{}") as Customer,
  admin: JSON.parse(localStorage.getItem("admin") || "{}") as Admin,
};

export const register = createAsyncThunk(
  "api/auth/register",
  async (payload: RegisterParams) => {
    try {
      const { data } = await axios.post(
        "https://pinaca-0-server.onrender.com/api/auth/signup",
        payload
      );

      return data;
    } catch (error: any) {
      throw new Error(
        error.response.data ? error.response.data.message : error.message
      );
    }
  }
);

export const login = createAsyncThunk(
  "/api/auth/login",
  async (payload: LoginParams) => {
    try {
      const { data } = await axios.post(
        "https://pinaca-0-server.onrender.com/api/auth/login",
        payload
      );

      return data;
    } catch (error: any) {
      throw new Error(
        error.response.data ? error.response.data.message : error.message
      );
    }
  }
);

export const fetchCustomer = createAsyncThunk(
  "/api/fetchCustomerData",
  async (customerId: string) => {
    try {
      const { data } = await axios(
        `https://pinaca-0-server.onrender.com/api/auth/customer/${customerId}`
      );
      return data;
    } catch (error: any) {
      throw new Error(
        error.response.data ? error.response.data.message : error.message
      );
    }
  }
);

export const fetchAdmin = createAsyncThunk(
  "/api/fetchAdminData",
  async (adminId: string) => {
    try {
      const { data } = await axios(
        `https://pinaca-0-server.onrender.com/api/auth/admin/${adminId}`
      );
      return data;
    } catch (error: any) {
      throw new Error(
        error.response.data ? error.response.data.message : error.message
      );
    }
  }
);

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("admin");
      localStorage.removeItem("customer");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.role = action.payload.role;
        if (action.payload.role === "admin") {
          state.admin = action.payload.user;
          localStorage.setItem("admin", JSON.stringify(action.payload.user));
        } else {
          state.customer = action.payload.user;
          localStorage.setItem("customer", JSON.stringify(action.payload.user));
        }
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("role", action.payload.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
    builder
      .addCase(fetchCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customer = action.payload.user;
        localStorage.setItem("customer", JSON.stringify(action.payload.user));
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
    builder
      .addCase(fetchAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admin = action.payload.user;
        localStorage.setItem("admin", JSON.stringify(action.payload.user));
      })
      .addCase(fetchAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
  },
});

export const { logout } = authSlice.actions;

export const authReducer = authSlice.reducer;
