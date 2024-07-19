import { createRoot } from "react-dom/client";
import {createStore} from "./state/store";
import { Provider } from "react-redux";
import { StrictMode } from "react";
import App from "./App";
import { PersistGate } from "redux-persist/integration/react";
import "normalize.css"
import "./index.css";

const container = document.getElementById("app")!;

const root = createRoot(container);

const {store, persistor} = createStore();

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);