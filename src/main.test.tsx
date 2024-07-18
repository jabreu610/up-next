import { cleanup, getRenderer, render, screen, waitFor } from "./test-util";
import userEvent from "@testing-library/user-event";
import { test } from "vitest";
import App from "./App";
import "@testing-library/jest-dom";
import { todos } from "./todos";
import { StorePartial } from "./store";
import { getInitialTestState } from "./getInitialTestState";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

test("header renders", async ({ expect }) => {
  render(<App />);
  await screen.findByRole("heading");
  expect(screen.getByRole("heading")).toHaveTextContent("Up Next");
});

test("can create a new todo", async ({ expect }) => {
  const user = userEvent.setup();
  render(<App />);
  // Wait for the "New Todo" button to appear, then click it
  await screen.findByText("New Todo");
  await user.click(screen.getByText("New Todo"));
  // Wait for the input to appear, then type a todo and press Enter
  const input = screen.getByPlaceholderText("New Todo");
  expect(input).toHaveFocus();
  const todoText = "a";
  await user.keyboard(todoText);
  await user.keyboard("{Enter}");
  // Expect the input to be gone and the new todo to be in the list
  const list = await screen.findByRole("list");
  expect(input).not.toBeInTheDocument();
  expect(list).toContainElement(screen.getByText(todoText));
});

test("should render an existing todo list", async ({ expect }) => {
  const state = await getInitialTestState(todos);
  const render = getRenderer(state as StorePartial);
  render(<App />);
  await screen.findByRole("list");
  const list = screen.getByRole("list").closest("ul")!;
  expect(list.children).toHaveLength(10);
});

test("should handle light dismiss", async ({ expect }) => {
  const user = userEvent.setup();
  const state = await getInitialTestState(todos);
  const render = getRenderer(state as StorePartial);
  render(<App />);
  const list = await screen.findAllByRole("listitem");
  const todo = list[0];
  expect(todo).toBeInTheDocument();
  await user.click(todo!);
  await waitFor(() => expect(todo).toHaveClass(/selected/g), { timeout: 1000 });
  await user.click(document.body);
  await waitFor(() => expect(todo).not.toHaveClass(/selected/g), {
    timeout: 1000,
  });
});

test("should handle archive", async ({ expect }) => {
  const user = userEvent.setup();
  const state = await getInitialTestState(todos);
  const render = getRenderer(state as StorePartial);
  render(<App />);
  const list = await screen.findAllByRole("listitem");
  const todo = list[0];
  expect(todo).toBeInTheDocument();
  await user.click(todo!);
  await waitFor(() => expect(todo).toHaveClass(/selected/g), { timeout: 1000 });
  const floatingControls = screen.getByRole("button", { name: "Delete" });
  await user.click(floatingControls);
  await waitFor(() => expect(todo).not.toBeInTheDocument(), { timeout: 1000 });
});
