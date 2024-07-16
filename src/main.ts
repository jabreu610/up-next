import { configureStore } from "@reduxjs/toolkit";
import "./style.css";
import todos from "./todos";

export type Nullable<T> = T | null;

export type Id = ReturnType<typeof crypto.randomUUID>;

configureStore({
  reducer: {
    todos,
  },
});
