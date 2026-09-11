import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import "./index.css";
import App from "./App.js";
import "@/api/axiosInterceptor.js";
import { Provider } from "react-redux";
import store from "./redux/store.js";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
);
