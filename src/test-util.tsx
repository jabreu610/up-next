/* eslint-disable react-refresh/only-export-components */
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { createStore, StorePartial } from "./store";
import { render } from "@testing-library/react";
import { ReactNode } from "react";

const ProviderWrapper = ({
  children,
  initStore,
}: {
  initStore?: StorePartial;
  children: ReactNode;
}): ReactNode => {
  const { store, persistor } = createStore(initStore);
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{children}</PersistGate>
    </Provider>
  );
};

type RenderParameters = Parameters<typeof render>;

const getRenderer = (initialState?: StorePartial) => {
  const wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <ProviderWrapper initStore={initialState}>{children}</ProviderWrapper>
    );
  };

  return (ui: RenderParameters[0], options?: RenderParameters[1]) =>
    render(ui, { wrapper, ...(options ?? {}) });
};

const customRender = (ui: RenderParameters[0], options?: RenderParameters[1]) =>
  render(ui, { wrapper: ProviderWrapper, ...(options ?? {}) });

export * from "@testing-library/react";

export { customRender as render, getRenderer };
