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
        return { payload: { id, ts: Date.now() } };
      },
    },
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