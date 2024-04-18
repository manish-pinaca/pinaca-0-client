/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface IService {
  service: string;
  _id: string;
}

export interface IInitialState {
  isLoading: boolean;
  serviceData: {
    services: IService[];
    page: number;
    totalServices: number;
  };
  error: string | null;
}

const initialState: IInitialState = {
  isLoading: false,
  serviceData: {
    services: [],
    page: 0,
    totalServices: 0,
  },
  error: null,
};

export const fetchServiceData = createAsyncThunk(
  "api/fetchServiceData",
  async (payload: GetServiceParams) => {
    try {
      const { page, limit } = payload;

      const { data } = await axios.get(
        `http://localhost:5000/api/services/get/all?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error: any) {
      throw new Error(
        error.response.data ? error.response.data.message : error.message
      );
    }
  }
);

const serviceSlice = createSlice({
  name: "serviceSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServiceData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.serviceData = action.payload;
      })
      .addCase(fetchServiceData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
  },
});

export const serviceReducer = serviceSlice.reducer;
