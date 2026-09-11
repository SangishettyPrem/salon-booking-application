import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "./auth.types";
import * as authTypes from "./auth.types";
import * as authAPI from "./auth.api";
import type { DefaultResponse } from "@/shared/types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  access_token: null,
  authError: null,
};

export const Login = createAsyncThunk<
  authTypes.LoginResponse,
  authTypes.LoginState
>("auth/login", async (request: authTypes.LoginState, { rejectWithValue }) => {
  try {
    const response = await authAPI.loginAPI(request);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to Login");
  }
});

export const Register = createAsyncThunk<
  DefaultResponse,
  authTypes.RegisterState
>(
  "auth/register",
  async (request: authTypes.RegisterState, { rejectWithValue }) => {
    try {
      const response = await authAPI.registerUserAPI(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to Register User",
      );
    }
  },
);

export const ForgotPassword = createAsyncThunk<DefaultResponse, string>(
  "auth/forgot-password",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPasswordAPI(email);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to Reset Password",
      );
    }
  },
);

export const UpdateProfile = createAsyncThunk<
  authTypes.UpdateProfileResponse,
  authTypes.UpdateProfileState
>(
  "auth/update-profile",
  async (request: authTypes.UpdateProfileState, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfileAPI(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to Update Profile",
      );
    }
  },
);

export const ResetPassword = createAsyncThunk<
  DefaultResponse,
  authTypes.ResetPasswordState
>(
  "auth/reset-password",
  async (request: authTypes.ResetPasswordState, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPasswordAPI(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to Reset Password",
      );
    }
  },
);

export const ChangePassword = createAsyncThunk<
  DefaultResponse,
  authTypes.ChangePasswordState
>(
  "auth/change-password",
  async (request: authTypes.ChangePasswordState, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePasswordAPI(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to Change Password",
      );
    }
  },
);

export const checkSession = createAsyncThunk<authTypes.CheckSessionResponse>(
  "auth/check-session",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.checkSessionAPI();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed");
    }
  },
);

export const logout = createAsyncThunk<DefaultResponse>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.logoutAPI();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed");
    }
  },
);

export const DeleteAccount = createAsyncThunk<DefaultResponse>(
  "auth/delete-account",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.deleteAccountAPI();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to Delete Account",
      );
    }
  },
);

export const SendOTP = createAsyncThunk<
  DefaultResponse,
  authTypes.SendOTPRequest
>(
  "auth/send-otp",
  async (request: authTypes.SendOTPRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendOTPAPI(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to send verification code",
      );
    }
  },
);

export const VerifyOTP = createAsyncThunk<
  authTypes.VerifyOTPResponse,
  authTypes.VerifyOTPRequest
>(
  "auth/verify-otp",
  async (request: authTypes.VerifyOTPRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOTPAPI(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to verify code",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.access_token = action.payload.access_token;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    setLogout: (state) => {
      state.user = null;
      state.access_token = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    setEmailVerified: (state, action) => {
      if (state.user) {
        state.user.emailVerified = action.payload ?? true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(Login.fulfilled, (state, action) => {
        if (!action.payload.success) return;
        state.isAuthenticated = true;
        state.isInitializing = false;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
        state.authError = null;
      })
      .addCase(Login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.isInitializing = false;
        state.authError = action.payload as string;
      })
      .addCase(checkSession.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isInitializing = false;
        if (!action.payload.success) {
          state.isAuthenticated = false;
          state.user = null;
          state.access_token = null;
          return;
        }

        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
      })
      .addCase(checkSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.isInitializing = false;
        state.user = null;
        state.access_token = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.access_token = null;
        state.isAuthenticated = false;
        state.isInitializing = false;
        state.authError = null;
      })
      .addCase(DeleteAccount.fulfilled, (state) => {
        state.user = null;
        state.access_token = null;
        state.isAuthenticated = false;
        state.isInitializing = false;
        state.authError = null;
      })
      .addCase(UpdateProfile.fulfilled, (state, action) => {
        if (!action.payload.success) return;
        state.user = action.payload.user;
      })
      .addCase(VerifyOTP.fulfilled, (state, action) => {
        if (state.user) {
          state.user.emailVerified = true;
        }
        if (action.payload?.user) {
          state.user = action.payload.user;
        }
      });
  },
});

export const { setCredentials, setLogout, setEmailVerified } =
  authSlice.actions;

export default authSlice.reducer;
