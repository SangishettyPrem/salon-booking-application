import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  DashboardStats,
  GetDashboardResponse,
  OwnerState,
} from "./owner.types";
import * as ownerAPI from "./owner.api";

const initialStats: DashboardStats = {
  todayBookings: 0,
  todayRevenue: 0,
  upcomingBookings: 0,
  activeStaff: 0,
  totalRevenue: 0,
  totalBookings: 0,
  pendingBookings: 0,
  completedBookings: 0,
};

const initialState: OwnerState = {
  isLoading: false,
  isDashboardFetched: false,
  stats: initialStats,
  recentBookings: [],
  error: null,
};

export const fetchDashboardStats = createAsyncThunk<
  GetDashboardResponse,
  string
>("owner/fetchDashboardStats", async (salonId, { rejectWithValue }) => {
  try {
    const response = await ownerAPI.getOwnerDashboardStatsAPI(salonId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch dashboard metrics",
    );
  }
});

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {
    resetOwnerState: (state) => {
      state.isDashboardFetched = false;
      state.isLoading = false;
      state.stats = initialStats;
      state.recentBookings = [];
      state.error = null;
    },
    updateDashboardStatLocal: (
      state,
      action: { payload: Partial<DashboardStats> },
    ) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isDashboardFetched = true;
        const { stats } = action.payload;
        if (stats) {
          state.stats = {
            todayBookings: stats.todayBookings ?? 0,
            todayRevenue: stats.todayRevenue ?? 0,
            upcomingBookings: stats.upcomingBookings ?? 0,
            activeStaff: stats.activeStaff ?? 0,
            totalRevenue: stats.totalRevenue ?? 0,
            totalBookings: stats.totalBookings ?? 0,
            pendingBookings: stats.pendingBookings ?? 0,
            completedBookings: stats.completedBookings ?? 0,
          };
        }
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to load dashboard";
      });
  },
});

export const { resetOwnerState, updateDashboardStatLocal } = ownerSlice.actions;

export default ownerSlice.reducer;
