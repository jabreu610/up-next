import { test, expect, beforeAll } from "vitest";
import {
  todos,
  todoAdded,
  selectAllTodos,
  selectUnscheduledActiveTodos,
  todoCompleted,
  selectTodoById,
  todoUncompleted,
  todoArchived,
  todoUnarchived,
  selectArchivedTodos,
  selectTodosByTags,
  tagAddedToTodo,
  tagRemovedFromTodo,
  todoTouched,
  todoContentUpdated,
} from "./todos";
import { getInitialTestState } from "../test/getInitialTestState";

let initialState: { todos: ReturnType<typeof todos.reducer> };

beforeAll(async () => {
  initialState = await getInitialTestState(todos);
  await new Promise((r) => setTimeout(r, 1000));
});

test("should return all todos", () => {
  expect(selectAllTodos(initialState)).toHaveLength(10);
});

test("unscheduled todos should be sorted by last update timestamp", () => {
  const content = "New todo";
  const todosState = todos.reducer(
    initialState.todos,
    todoAdded({ content, notes: null, dueTs: null, tags: [] })
  );
  const state = { todos: todosState };
  const unscheduledTodos = selectUnscheduledActiveTodos(state);
  expect(unscheduledTodos?.[0]?.content).toBe(content);
});

test("completing a todo should mark it as completed", () => {
  const id = selectAllTodos(initialState)[0].id;
  const state = {
    todos: todos.reducer(initialState.todos, todoCompleted(id)),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.completedTs).not.toBeNull();
});

test("uncompleting a todo should mark it as active", () => {
  const id = selectAllTodos(initialState)[0].id;
  const state = {
    todos: todos.reducer(initialState.todos, todoUncompleted(id)),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.completedTs).toBeNull();
});

test("archiving a todo should mark it as archived", () => {
  const id = selectAllTodos(initialState)[0].id;
  const state = {
    todos: todos.reducer(initialState.todos, todoArchived(id)),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.archivedTs).not.toBeNull();
});

test("unarchiving a todo should mark it as active", () => {
  const id = selectAllTodos(initialState)[0].id;
  const state = {
    todos: todos.reducer(initialState.todos, todoUnarchived(id)),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.archivedTs).toBeNull();
});

test("should return all archived todos", () => {
  const id = selectAllTodos(initialState)[0].id;
  const state = {
    todos: todos.reducer(initialState.todos, todoArchived(id)),
  };
  const archivedTodos = selectArchivedTodos(state);
  expect(archivedTodos).toHaveLength(1);
});

test("should return todo by tags", () => {
  const todos = selectTodosByTags(initialState, ["work"]);
  expect(todos).toHaveLength(3);
});

test("should return todo by multiple tags sorted by count", () => {
  const todos = selectTodosByTags(initialState, [
    "family",
    "personal",
    "tagThatDoesNotExist",
  ]);
  const expectedContent = "Call mom";
  expect(todos).toHaveLength(6);
  expect(todos[0]?.content).toBe(expectedContent);
});

test("should add a new tag to a todo", () => {
  const id = selectAllTodos(initialState)[0].id;
  const tag = "new-tag";
  const state = {
    todos: todos.reducer(initialState.todos, tagAddedToTodo(id, tag)),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.tags).toContain(tag);
});

test("should add an existing tag to a todo", () => {
  const id = selectAllTodos(initialState)[0].id;
  const tag = "work";
  const state = {
    todos: todos.reducer(initialState.todos, tagAddedToTodo(id, tag)),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.tags).toContain(tag);
  expect(todo.updatedTs).toBeGreaterThan(todo.createdTs);
});

test("should remove a tag from a todo", () => {
  const id = selectAllTodos(initialState)[0].id;
  const tag = "personal";
  const state = {
    todos: todos.reducer(initialState.todos, tagRemovedFromTodo(id, tag)),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.tags).not.toContain(tag);
});

test("newly created empty todo should have equal created and updated timestamps", () => {
  const content = "";
  const todosState = todos.reducer(
    initialState.todos,
    todoAdded({ content, notes: null, dueTs: null, tags: [] })
  );
  const state = { todos: todosState };
  const todo = selectAllTodos(state).find((t) => t.content === content);
  expect(todo?.createdTs).toBe(todo?.updatedTs);
});

test("touching a todo should update the updated timestamp", () => {
  const id = selectAllTodos(initialState)[0].id;
  const state = {
    todos: todos.reducer(initialState.todos, todoTouched(id)),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.updatedTs).toBeGreaterThan(todo?.createdTs);
});

test("should update todo content", () => {
  const id = selectAllTodos(initialState)[0].id;
  const content = "Updated content";
  const state = {
    todos: todos.reducer(
      initialState.todos,
      todoContentUpdated(id, { content })
    ),
  };
  const todo = selectTodoById(state, id);
  expect(todo?.content).toBe(content);
});
