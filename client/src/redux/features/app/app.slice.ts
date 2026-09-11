import { createSlice } from "@reduxjs/toolkit";
import type { AppState } from "./app.types";

const initialState: AppState = {
  theme: "light",
  appLoading: false,
  serverDown: false,
  sessionExpired: false,
};

const appSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setServerDown(state, action) {
      state.serverDown = action.payload;
    },
    setSessionExpired(state, action) {
      state.sessionExpired = action.payload;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
  },
});

export const { setServerDown, setTheme, setSessionExpired } = appSlice.actions;

export default appSlice.reducer;
