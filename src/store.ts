import { combineSlices, configureStore } from "@reduxjs/toolkit";
import {todos} from "./todos";
import storage from "redux-persist/lib/storage";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";

const rootReducer = combineSlices(todos);
const persistConfig = {
  key: "root",
  version: 1,
  storage,
}
const persistedReducer = persistReducer(persistConfig, rootReducer);

export type StorePartial = Parameters< typeof persistedReducer>[0];

export function createStore(preloadedState?: StorePartial) {
  const store = configureStore({
    reducer: persistedReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

  const persistor = persistStore(store);

  return {store, persistor};
}  

type Store = ReturnType<typeof createStore>["store"];
export type RootState = ReturnType<Store["getState"]>;
export type AppDispatch = Store["dispatch"];