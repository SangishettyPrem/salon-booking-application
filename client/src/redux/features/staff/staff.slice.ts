import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  GetStaffResponse,
  StaffActionRequest,
  StaffActionResponse,
  StaffState,
} from "./staff.types";
import * as staffAPI from "./staff.api";
import type { DefaultResponse } from "@/shared/types";

const initialState: StaffState = {
  isLoading: false,
  isStaffFetched: false,
  staffList: [],
  error: null,
};

export const getStaff = createAsyncThunk<GetStaffResponse, string>(
  "staff/getStaff",
  async (salonId, { rejectWithValue }) => {
    try {
      const response = await staffAPI.getStaffAPI(salonId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response.data.message ?? "Failed to Load Staff. Try Again Later.",
      );
    }
  },
);

export const createStaff = createAsyncThunk<
  StaffActionResponse,
  { request: StaffActionRequest; salonId: string }
>(
  "staff/createStaff",
  async (
    { request, salonId }: { salonId: string; request: StaffActionRequest },
    { rejectWithValue },
  ) => {
    try {
      const response = await staffAPI.createStaffAPI(salonId, request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response.data.message ?? "Failed to Add Staff. Try Again Later.",
      );
    }
  },
);

export const updateStaff = createAsyncThunk<
  StaffActionResponse,
  { request: StaffActionRequest; staffId: string }
>(
  "staff/updateStaff",
  async (
    { request, staffId }: { staffId: string; request: StaffActionRequest },
    { rejectWithValue },
  ) => {
    try {
      const response = await staffAPI.updateStaffAPI(staffId, request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response.data.message ?? "Failed to Add Staff. Try Again Later.",
      );
    }
  },
);

export const deleteStaff = createAsyncThunk<DefaultResponse, string>(
  "staff/deleteStaff",
  async (staffId: string, { rejectWithValue }) => {
    try {
      const response = await staffAPI.deleteStaffAPI(staffId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response.data.message ??
          "Failed to Delete Staff. Try Again Later.",
      );
    }
  },
);

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getStaff.pending, (state) => {
        state.isLoading = true;
        state.isStaffFetched = false;
        state.error = null;
      })
      .addCase(getStaff.fulfilled, (state, action) => {
        if (!action.payload.success) return;
        state.isLoading = false;
        state.isStaffFetched = true;
        state.staffList = action.payload.staff;
      })
      .addCase(getStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.isStaffFetched = false;
        state.error =
          (action.payload as string) ||
          "Failed to Load Staff. Try Again Later.";
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        if (!action.payload.success) return;

        state.staffList.unshift(action.payload.staff);
        state.isStaffFetched = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        if (!action.payload.success) return;
        state.isStaffFetched = true;
        state.isLoading = false;
        state.error = null;

        const updatedStaff = action.payload.staff;
        state.staffList = state.staffList.map((s) =>
          s._id === updatedStaff._id ? updatedStaff : s,
        );
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        if (!action.payload.success) return;

        state.staffList = state.staffList.filter(
          (staff) => staff._id !== action.meta.arg,
        );
        state.isStaffFetched = true;
        state.isLoading = false;
        state.error = null;
      }),
});

export default staffSlice.reducer;
