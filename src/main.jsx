import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.jsx";
import store from "./store.js";
import { Provider } from "react-redux";
import makeServer from "../mock-data";

if (process.env.NODE_ENV === "development") {
  makeServer();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
