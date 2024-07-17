import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { Nullable, Id } from "./util";

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
  tags: Tag["name"][];
};

type Tag = {
  name: string;
  todos: Id[];
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

const tagsAdapter = createEntityAdapter({
  selectId: (tag: Tag) => tag.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const todos = createSlice({
  name: "todos",
  initialState: todosAdapter.getInitialState({
    tags: tagsAdapter.getInitialState(),
  }),
  reducers: {
    todoAdded: {
      reducer(state, action: PayloadAction<[Todo, Tag[]]>) {
        const [todo, tags] = action.payload;
        for (const tag of tags) {
          const existing = tagsAdapter
            .getSelectors()
            .selectById(state.tags, tag.name);
          if (existing) {
            tagsAdapter.updateOne(state.tags, {
              id: tag.name,
              changes: { todos: [...existing.todos, todo.id] },
            });
          } else {
            tagsAdapter.addOne(state.tags, tag);
          }
        }
        todosAdapter.addOne(state, todo);
      },
      prepare(input: NewTodo) {
        return { payload: createTodoAndTags(input) };
      },
    },
    todoContentUpdated: {
      reducer(
        state,
        action: PayloadAction<{ id: Id; update: Partial<Todo>; ts: number }>
      ) {
        todosAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { ...action.payload.update, updatedTs: action.payload.ts },
        });
      },
      prepare(id: Id, update: Partial<Todo>) {
        return { payload: { id, update, ts: Date.now() } };
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
    tagAddedToTodo: {
      reducer(
        state,
        action: PayloadAction<{ ts: number; tag: string; id: Todo["id"] }>
      ) {
        const todo = todosAdapter
          .getSelectors()
          .selectById(state, action.payload.id);
        if (todo && !todo.tags.includes(action.payload.tag)) {
          const updatedTags = [...todo.tags, action.payload.tag];
          todosAdapter.updateOne(state, {
            id: action.payload.id,
            changes: { tags: updatedTags, updatedTs: action.payload.ts },
          });
          const tag = tagsAdapter
            .getSelectors()
            .selectById(state.tags, action.payload.tag);
          if (tag) {
            tagsAdapter.updateOne(state.tags, {
              id: action.payload.tag,
              changes: { todos: [...tag.todos, action.payload.id] },
            });
          } else {
            tagsAdapter.addOne(state.tags, {
              name: action.payload.tag,
              todos: [action.payload.id],
            });
          }
        }
      },
      prepare(id: Id, tag: string, ts?: number) {
        return { payload: { ts: ts ?? Date.now(), tag, id } };
      },
    },
    tagRemovedFromTodo: {
      reducer(
        state,
        action: PayloadAction<{ ts: number; tag: string; id: Todo["id"] }>
      ) {
        const todo = todosAdapter
          .getSelectors()
          .selectById(state, action.payload.id);
        if (todo && todo.tags.includes(action.payload.tag)) {
          const updatedTags = todo.tags.filter(
            (name) => name !== action.payload.tag
          );
          todosAdapter.updateOne(state, {
            id: action.payload.id,
            changes: { tags: updatedTags, updatedTs: action.payload.ts },
          });
          const tag = tagsAdapter
            .getSelectors()
            .selectById(state.tags, action.payload.tag);
          if (tag) {
            tagsAdapter.updateOne(state.tags, {
              id: action.payload.tag,
              changes: {
                todos: tag.todos.filter((id) => id !== action.payload.id),
              },
            });
          }
        }
      },
      prepare(id: Id, tag: string) {
        return { payload: { ts: Date.now(), tag, id } };
      },
    },
    todoTouched: {
      reducer(state, action: PayloadAction<{ id: Id; ts: number }>) {
        todosAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { updatedTs: action.payload.ts },
        });
      },
      prepare(id: Id) {
        return {payload: {id, ts: Date.now()}}
      }
    }
  },
  selectors: {
    selectTodoById: todosAdapter.getSelectors().selectById,
    selectAllTodos: todosAdapter.getSelectors().selectAll,
    selectActiveTodos: createSelector(
      todosAdapter.getSelectors().selectAll,
      (todos) => todos.filter((todo) => !todo.archivedTs && !todo.completedTs)
    ),
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
    selectTodosByTags: (state, tags: string[]): Todo[] => {
      const counts = tags
        .map(
          (tag) =>
            tagsAdapter.getSelectors().selectById(state.tags, tag)?.todos ?? []
        )
        .filter((todos) => todos.length > 0)
        .reduce(
          (acc, val) => {
            val.forEach((id) => {
              acc[id] ??= 0;
              acc[id]++;
            });
            return acc;
          },
          {} as Record<Id, number>
        );
      return (Object.entries(counts) as [Id, number][])
        .toSorted((a, b) => {
          return b[1] - a[1];
        })
        .map(([id]) => todosAdapter.getSelectors().selectById(state, id));
    },
  },
});

function createTodoAndTags(input: NewTodo): [Todo, Tag[]] {
  const id = crypto.randomUUID();
  const now = Date.now();
  return [
    {
      id,
      content: input.content,
      notes: input.notes,
      createdTs: now,
      updatedTs: now,
      archivedTs: null,
      completedTs: null,
      dueTs: input.dueTs?.valueOf() ?? null,
      tags: input.tags,
    },
    input.tags.map((name) => ({
      name,
      todos: [id],
    })),
  ];
}

export const {
  todoAdded,
  todoContentUpdated,
  todoCompleted,
  todoArchived,
  todoUncompleted,
  todoUnarchived,
  todoTouched,
  tagAddedToTodo,
  tagRemovedFromTodo,
} = todos.actions;

export const {
  selectTodoById,
  selectAllTodos,
  selectActiveTodos,
  selectArchivedTodos,
  selectUnscheduledActiveTodos,
  selectTodosByTags,
} = todos.selectors;

export default todos.reducer;

if (import.meta.vitest) {
  const { test, expect, beforeAll } = import.meta.vitest;
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

    for (const todo of mockTodos) {
      initialState.todos = todos.reducer(initialState.todos, todoAdded(todo));
    }

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
}
