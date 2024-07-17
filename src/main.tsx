import { createRoot } from "react-dom/client";
import { persistor, store } from "./store";
import { Provider } from "react-redux";
import { StrictMode } from "react";
import App from "./App";
import "normalize.css"
import "./index.css";
import { PersistGate } from "redux-persist/integration/react";

const container = document.getElementById("app")!;

const root = createRoot(container);

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
