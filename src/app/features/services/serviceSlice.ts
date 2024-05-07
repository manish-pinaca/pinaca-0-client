/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface IService {
  service: string;
  _id: string;
  status?: string;
}

export interface IInitialState {
  isLoading: boolean;
  allServices: {
    services: IService[];
    page: number;
    totalServices: number;
  };
  serviceData: {
    services: IService[];
    page: number;
    totalServices: number;
  };
  error: string | null;
}

const initialState: IInitialState = {
  isLoading: false,
  allServices: {
    services: [],
    page: 0,
    totalServices: 0,
  },
  serviceData: {
    services: [],
    page: 0,
    totalServices: 0,
  },
  error: null,
};

export const fetchActiveServiceData = createAsyncThunk(
  "api/fetchActiveServiceData",
  async (payload: GetServiceParams) => {
    try {
      const { page, limit } = payload;

      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/services/getAllServices/active?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error: any) {
      throw new Error(
        error.response.data ? error.response.data.message : error.message
      );
    }
  }
);

export const fetchAllServices = createAsyncThunk(
  "api/fetchAllServices",
  async (payload: GetServiceParams) => {
    try {
      const { page, limit } = payload;

      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/services/get/all?page=${page}&limit=${limit}`
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
      .addCase(fetchActiveServiceData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchActiveServiceData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.serviceData = action.payload;
      })
      .addCase(fetchActiveServiceData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
    builder
      .addCase(fetchAllServices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allServices = action.payload;
      })
      .addCase(fetchAllServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message!;
      });
  },
});

export const serviceReducer = serviceSlice.reducer;
