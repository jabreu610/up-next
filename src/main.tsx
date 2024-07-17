import { createRoot } from "react-dom/client";
import { store } from "./store";
import { Provider } from "react-redux";
import { StrictMode } from "react";
import App from "./App";
import "normalize.css"
import "./index.css";

const container = document.getElementById("app")!;

const root = createRoot(container);

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
