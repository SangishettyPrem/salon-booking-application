export interface AppState {
  theme: "light" | "dark";
  serverDown: boolean;
  appLoading: boolean;
  sessionExpired: boolean;
}
