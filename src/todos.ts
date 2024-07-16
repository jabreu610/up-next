import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { Nullable, Id } from "./main";

type NewTodo = {
  content: string;
  notes: Nullable<string>;
  dueTs: Nullable<Date>;
  tags: string[];
};

type Todo = {
  id: Id;
  content: string;
  notes: Nullable<string>;
  createdTs: number;
  updatedTs: number;
  archivedTs: Nullable<number>;
  completedTs: Nullable<number>;
  dueTs: Nullable<number>;
  tags: string[];
};

const todosAdapter = createEntityAdapter({
  selectId: (todo: Todo) => todo.id,
  sortComparer: (a, b) => {
    if (a.dueTs === null && b.dueTs === null) return 0;
    if (a.dueTs === null) return 1;
    if (b.dueTs === null) return -1;
    return a.dueTs - b.dueTs;
  },
});

const todos = createSlice({
  name: "todos",
  initialState: todosAdapter.getInitialState(),
  reducers: {
    todoAdded: {
      reducer(state, action: PayloadAction<Todo>) {
        todosAdapter.addOne(state, action.payload);
      },
      prepare(input: NewTodo) {
        return { payload: createTodo(input) };
      },
    },
    todoCompleted: {
      reducer(state, action: PayloadAction<{ id: Id; ts: number }>) {
        todosAdapter.updateOne(state, {
          id: action.payload.id,
          changes: {
            completedTs: action.payload.ts,
            updatedTs: action.payload.ts,
          },
        });
      },
      prepare(id: Id) {
        return { payload: { id, ts: Date.now() } };
      },
    },
    todoUncompleted: {
      reducer(state, action: PayloadAction<{ id: Id; ts: number }>) {
        todosAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { completedTs: null, updatedTs: action.payload.ts },
        });
      },
      prepare(id: Id) {
        return { payload: { id, ts: Date.now() } };
      },
    },
    todoArchived: {
      reducer(state, action: PayloadAction<{ id: Id; ts: number }>) {
        todosAdapter.updateOne(state, {
          id: action.payload.id,
          changes: {
            archivedTs: action.payload.ts,
            updatedTs: action.payload.ts,
          },
        });
      },
      prepare(id: Id) {
        return { payload: { id, ts: Date.now() } };
      },
    },
    todoUnarchived: {
      reducer(state, action: PayloadAction<{ id: Id; ts: number }>) {
        todosAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { archivedTs: null, updatedTs: action.payload.ts },
        });
      },
      prepare(id: Id) {
        return { payload: { id, ts: Date.now() } };
      },
    },
  },
  selectors: {
    selectTodoById: todosAdapter.getSelectors().selectById,
    selectAllTodos: todosAdapter.getSelectors().selectAll,
    selectActiveTodos: (state): Todo[] => {
      return todos
        .getSelectors()
        .selectAllTodos(state)
        .filter((todo) => !todo.archivedTs && !todo.completedTs);
    },
    selectArchivedTodos: (state): Todo[] => {
      return todos
        .getSelectors()
        .selectAllTodos(state)
        .filter((todo) => todo.archivedTs)
        .toSorted((a, b) => b.updatedTs - a.updatedTs);
    },
    selectUnscheduledActiveTodos: (state): Todo[] => {
      return todos
        .getSelectors()
        .selectActiveTodos(state)
        .filter((todo) => !todo.dueTs)
        .toSorted((a, b) => b.updatedTs - a.updatedTs);
    },
  },
});

function createTodo(input: NewTodo): Todo {
  let id = crypto.randomUUID();
  let now = Date.now();
  return {
    id,
    content: input.content,
    notes: input.notes,
    createdTs: now,
    updatedTs: now,
    archivedTs: null,
    completedTs: null,
    dueTs: input.dueTs?.valueOf() ?? null,
    tags: input.tags,
  };
}

export const { todoAdded, todoCompleted, todoArchived, todoUncompleted, todoUnarchived } = todos.actions;

export const {
  selectTodoById,
  selectAllTodos,
  selectActiveTodos,
  selectArchivedTodos,
  selectUnscheduledActiveTodos,
} = todos.selectors;

export default todos.reducer;

if (import.meta.vitest) {
  const { test, expect, beforeAll, describe } = import.meta.vitest;
  let initialState: { todos: ReturnType<typeof todos.reducer> };

  beforeAll(async () => {
    const mockTodos: NewTodo[] = [
      {
        content: "Finish the project report",
        notes: "Include the latest statistics",
        dueTs: new Date("2024-07-20T10:00:00Z"),
        tags: ["work", "urgent"],
      },
      {
        content: "Grocery shopping",
        notes: null,
        dueTs: new Date("2024-07-18T17:00:00Z"),
        tags: ["personal", "errands"],
      },
      {
        content: "Schedule a dentist appointment",
        notes: "Prefer morning slots",
        dueTs: null,
        tags: ["health"],
      },
      {
        content: "Prepare for the Monday meeting",
        notes: "Review the agenda and prepare notes",
        dueTs: new Date("2024-07-21T09:00:00Z"),
        tags: ["work", "meeting"],
      },
      {
        content: "Plan weekend getaway",
        notes: "Look for nearby hiking spots",
        dueTs: new Date("2024-07-22T14:00:00Z"),
        tags: ["personal", "leisure"],
      },
      {
        content: "Update resume and LinkedIn profile",
        notes: "Highlight recent projects",
        dueTs: null,
        tags: ["work", "career"],
      },
      {
        content: "Call mom",
        notes: null,
        dueTs: new Date("2024-07-19T19:00:00Z"),
        tags: ["personal", "family"],
      },
      {
        content: "Renew car insurance",
        notes: "Check for discounts",
        dueTs: new Date("2024-07-25T12:00:00Z"),
        tags: ["personal", "finance"],
      },
      {
        content: "Read the new book",
        notes: "Start with chapter 1",
        dueTs: null,
        tags: ["personal", "reading"],
      },
      {
        content: "Organize workspace",
        notes: "Clean and declutter desk",
        dueTs: new Date("2024-07-23T15:00:00Z"),
        tags: ["personal", "home"],
      },
    ];

    initialState = { todos: todos.reducer(undefined, { type: "unknown" }) };

    for (let todo of mockTodos) {
      initialState.todos = todos.reducer(initialState.todos, todoAdded(todo));
    }

    await new Promise((r) => setTimeout(r, 1000));
  });

  describe("selectors", () => {
    test("should return all todos", () => {
      expect(selectAllTodos(initialState)).toHaveLength(10);
    });

    test("unscheduled todos should be sorted by last update timestamp", () => {
      let content = "New todo";
      let todosState = todos.reducer(
        initialState.todos,
        todoAdded({ content, notes: null, dueTs: null, tags: [] })
      );
      let state = { todos: todosState };
      let unscheduledTodos = selectUnscheduledActiveTodos(state);
      expect(unscheduledTodos?.[0]?.content).toBe(content);
    });

    test("completing a todo should mark it as completed", () => {
      let id = selectAllTodos(initialState)[0].id;
      let state = {
        todos: todos.reducer(initialState.todos, todoCompleted(id)),
      };
      let todo = selectTodoById(state, id);
      expect(todo?.completedTs).not.toBeNull();
    });

    test("uncompleting a todo should mark it as active", () => {
      let id = selectAllTodos(initialState)[0].id;
      let state = {
        todos: todos.reducer(initialState.todos, todoUncompleted(id)),
      };
      let todo = selectTodoById(state, id);
      expect(todo?.completedTs).toBeNull();
    });

    test("archiving a todo should mark it as archived", () => {
      let id = selectAllTodos(initialState)[0].id;
      let state = {
        todos: todos.reducer(initialState.todos, todoArchived(id)),
      };
      let todo = selectTodoById(state, id);
      expect(todo?.archivedTs).not.toBeNull();
    });

    test("unarchiving a todo should mark it as active", () => {
      let id = selectAllTodos(initialState)[0].id;
      let state = {
        todos: todos.reducer(initialState.todos, todoUnarchived(id)),
      };
      let todo = selectTodoById(state, id);
      expect(todo?.archivedTs).toBeNull();
    });

    test("should return all archived todos", () => {
      let id = selectAllTodos(initialState)[0].id;
      let state = {
        todos: todos.reducer(initialState.todos, todoArchived(id)),
      };
      let archivedTodos = selectArchivedTodos(state);
      expect(archivedTodos).toHaveLength(1);
    });
  });
}
