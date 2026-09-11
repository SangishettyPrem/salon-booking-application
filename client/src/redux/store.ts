import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/auth.slice";
import appReducer from "./features/app/app.slice";
import ownerReducer from "./features/owner/owner.slice";
import salonReducer from "./features/salon/salon.slice";
import servicesReducer from "./features/services/services.slice";
import staffReducer from "./features/staff/staff.slice";
import bookingsReducer from "./features/bookings/bookings.slice";
import paymentReducer from "./features/payment/payment.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    owner: ownerReducer,
    salon: salonReducer,
    services: servicesReducer,
    staff: staffReducer,
    bookings: bookingsReducer,
    payment: paymentReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
