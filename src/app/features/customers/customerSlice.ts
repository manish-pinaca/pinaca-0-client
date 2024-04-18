/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface ICustomer {
  _id: string;
  customerName: string;
  adminId: string;
  userEmail: string;
  activeServices: string[];
  pendingServices: string[];
  rejectedServices: string[];
}

export interface IInitialState {
  isLoading: boolean;
  customerData: {
    customers: ICustomer[];
    page: number;
    totalCustomers: number;
  } | null;
  error: string | null;
}

const initialState: IInitialState = {
  isLoading: false,
  customerData: null,
  error: null,
};

export const fetchCustomerData = createAsyncThunk(
  "api/fetchCustomerData",
  async (payload: GetCustomerParams) => {
    try {
      const { page, limit } = payload;
      const { data } = await axios.get(
        `http://localhost:5000/api/customer/get/all?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error: any) {
      throw new Error(
        error.response.data ? error.response.data.message : error.message
      );
    }
  }
);

const customerSlice = createSlice({
  name: "customerSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCustomerData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerData = action.payload;
      })
      .addCase(fetchCustomerData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
  },
});

export const customerReducer = customerSlice.reducer;
