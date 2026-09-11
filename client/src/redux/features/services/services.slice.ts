import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as servicesAPI from "./services.api";

import type {
  ServiceActionResponse,
  fetchServicesBySalonResponse,
  Service,
  ServicesInitialState,
} from "./services.types";
import type { DefaultResponse } from "@/shared/types";

const initialState: ServicesInitialState = {
  isLoading: false,
  isServicesFetched: false,
  services: [],
  error: null,
};

export const fetchServicesBySalon = createAsyncThunk<
  fetchServicesBySalonResponse,
  {
    salonId: string;
  }
>("service/fetchServicesBySalon", async ({ salonId }, { rejectWithValue }) => {
  try {
    const res = await servicesAPI.getServicesBySalonIdAPI(salonId);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ??
        "Failed to load services. Try Again Later.",
    );
  }
});

export const createService = createAsyncThunk<
  ServiceActionResponse,
  { salonId: string; service: Service }
>(
  "service/createService",
  async ({ salonId, service }, { rejectWithValue }) => {
    try {
      const res = await servicesAPI.createServiceAPI(salonId, service);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to create service.",
      );
    }
  },
);

export const updateService = createAsyncThunk<
  ServiceActionResponse,
  { serviceId: string; service: Service }
>(
  "service/updateService",
  async ({ serviceId, service }, { rejectWithValue }) => {
    try {
      const res = await servicesAPI.updateServiceAPI(serviceId, service);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to Update service.",
      );
    }
  },
);

export const deleteService = createAsyncThunk<DefaultResponse, string>(
  "service/deleteService",
  async (serviceId, { rejectWithValue }) => {
    try {
      const res = await servicesAPI.deleteServiceAPI(serviceId);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to Delete service.",
      );
    }
  },
);

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchServicesBySalon.pending, (state) => {
        state.isLoading = true;
        state.isServicesFetched = false;
        state.error = null;
      })
      .addCase(fetchServicesBySalon.fulfilled, (state, action) => {
        if (!action.payload.success) return;
        state.services = action.payload.services;
        state.isLoading = false;
        state.isServicesFetched = true;
      })
      .addCase(fetchServicesBySalon.rejected, (state, action) => {
        state.isLoading = false;
        state.isServicesFetched = false;
        state.error =
          (action.payload as string) ??
          "Unable to Load Services. Try Again Later";
      })
      .addCase(createService.fulfilled, (state, action) => {
        if (!action.payload.success) return;

        state.services.unshift(action.payload.service);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        if (!action.payload.success) return;

        const updatedService = action.payload.service;
        const index = state.services.findIndex(
          (s) => s._id === updatedService._id,
        );

        if (index !== -1) {
          state.services[index] = updatedService;
        }
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        if (!action.payload.success) return;

        // Filter out the deleted service
        state.services = state.services.filter(
          (service) => service._id !== action.meta.arg,
        );
      }),
});

export default serviceSlice.reducer;
