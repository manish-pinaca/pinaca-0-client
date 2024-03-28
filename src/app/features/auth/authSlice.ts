/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface AuthState {
  isLoading: boolean;
  error: string;
  token: string;
}

const initialState: AuthState = {
  isLoading: false,
  error: "",
  token: localStorage.getItem("token") || "",
};

export const register = createAsyncThunk(
  "api/auth/register",
  async (payload: RegisterParams) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/signup",
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
        "http://localhost:5000/api/login",
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

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = "";
      localStorage.removeItem("token");
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
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
  },
});

export const { logout } = authSlice.actions;

export const authReducer = authSlice.reducer;
