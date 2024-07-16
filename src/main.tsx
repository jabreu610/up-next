import { createRoot } from "react-dom/client";
import { store } from "./store";
import { Provider } from "react-redux";
import "./index.css";
import { StrictMode } from "react";

const container = document.getElementById("app")!;

const root = createRoot(container);

root.render(
  <StrictMode>
    <Provider store={store}>
      <h1>Hello World</h1>
    </Provider>
  </StrictMode>
);
