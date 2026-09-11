import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as salonAPI from "./salon.api";
import type {
  getSalonByOwnerResponse,
  getAllSalonParams,
  SalonCreationState,
  SalonSliceState,
  UpdateSalonRequest,
  getAllSalonResponse,
  getPublicSalonByIdResponse,
} from "./salon.types";
import type { DefaultResponse } from "@/shared/types";
import { getSalonKey } from "@/utils";

const initialState: SalonSliceState = {
  error: null,
  isInitilazing: false,
  salon: null,
  isSalonFetched: false,

  salons: {},

  isSalonsLoading: false,
  isSalonsFetched: false,
  pagination: null,

  publicSalons: {},
  publicSalonsError: {},
  isPublicSalonsLoading: false,
};

export const fetchSalonByOwner = createAsyncThunk<getSalonByOwnerResponse>(
  "salon/fetchSalonByOwner",
  async (_, { rejectWithValue }) => {
    try {
      const response = await salonAPI.getSalonByOwnerAPI();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch salon",
      );
    }
  },
);

export const createSalon = createAsyncThunk<
  getSalonByOwnerResponse,
  SalonCreationState
>(
  "salon/createSalon",
  async (request: SalonCreationState, { rejectWithValue }) => {
    try {
      const response = await salonAPI.createSalonOwnerAPI(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create salon",
      );
    }
  },
);

export const updateSalon = createAsyncThunk<
  getSalonByOwnerResponse,
  { request: UpdateSalonRequest; salonId: string }
>("salon/updateSalon", async ({ request, salonId }, { rejectWithValue }) => {
  try {
    const response = await salonAPI.updateSalonOwnerAPI(request, salonId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to update salon profile",
    );
  }
});

export const deleteSalon = createAsyncThunk<DefaultResponse, string>(
  "salon/deleteSalon",
  async (salonId: string, { rejectWithValue }) => {
    try {
      const response = await salonAPI.deleteSalonOwnerAPI(salonId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete salon",
      );
    }
  },
);

export const getAllSalon = createAsyncThunk<
  getAllSalonResponse,
  getAllSalonParams
>(
  "salon/getAllSalon",
  async (params: getAllSalonParams, { rejectWithValue }) => {
    try {
      const response = await salonAPI.getAllSalonsAPI(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch all salons",
      );
    }
  },
);

export const getSalonById = createAsyncThunk<
  getPublicSalonByIdResponse,
  string
>("salon/getSalonById", async (salonId: string, { rejectWithValue }) => {
  try {
    const response = await salonAPI.getPublicSalonByIdAPI(salonId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch salon",
    );
  }
});

const salonSlice = createSlice({
  name: "salon",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchSalonByOwner.pending, (state) => {
        state.isInitilazing = true;
        state.error = null;
        state.isSalonFetched = false;
      })
      .addCase(fetchSalonByOwner.fulfilled, (state, action) => {
        if (!action.payload.success) return;

        state.isInitilazing = false;
        state.isSalonFetched = true;
        state.error = null;
        state.salon = action.payload.salon ?? null;
      })
      .addCase(fetchSalonByOwner.rejected, (state, action) => {
        state.isInitilazing = false;
        state.isSalonFetched = true;
        state.error = action.payload as string;
      })
      .addCase(createSalon.fulfilled, (state, action) => {
        if (!action.payload.success) return;

        state.salon = action.payload.salon;
      })
      .addCase(updateSalon.fulfilled, (state, action) => {
        if (!action.payload.success) return;
        state.salon = action.payload.salon;
      })
      .addCase(deleteSalon.fulfilled, (state) => {
        state.salon = null;
      })
      .addCase(getAllSalon.pending, (state) => {
        state.isSalonsLoading = true;
        state.error = null;
      })
      .addCase(getAllSalon.fulfilled, (state, action) => {
        if (!action.payload.success) return;

        const { limit, page } = action.meta.arg;
        const key = getSalonKey(page, limit);
        state.isSalonsLoading = false;
        state.isSalonsFetched = true;
        state.error = null;
        state.salons[key] = action.payload.salons || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(getAllSalon.rejected, (state, action) => {
        state.isSalonsLoading = false;
        state.isSalonsFetched = true;
        state.error = action.payload as string;
      })
      .addCase(getSalonById.pending, (state) => {
        state.isPublicSalonsLoading = true;
      })
      .addCase(getSalonById.fulfilled, (state, action) => {
        if (!action.payload.success) return;
        const salonId = action.meta.arg;
        const { salon, services, staff } = action.payload.data;
        state.publicSalons[salonId] = salon;
        state.publicSalons[salonId].services = services ?? [];
        state.publicSalons[salonId].staff = staff ?? [];
        state.publicSalonsError[salonId] = null;
        state.isPublicSalonsLoading = false;
      })
      .addCase(getSalonById.rejected, (state, action) => {
        const salonId = action.meta.arg;
        state.isPublicSalonsLoading = false;
        state.publicSalonsError[salonId] = action.payload as string;
      }),
});

export default salonSlice.reducer;
