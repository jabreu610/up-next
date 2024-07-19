import { useDispatch, useSelector } from "react-redux";
import { Id } from "../util";
import {
  selectTodoById,
  tagAddedToTodo,
  tagRemovedFromTodo,
  todoCompleted,
  todoContentUpdated,
  todoUncompleted,
} from "../state/todos";
import { RootState } from "../state/store";
import { useCallback, useMemo } from "react";

type TodoUpdate = {
  content?: string;
  notes?: string;
};

export function useTodoById(id: Id) {
  const todo = useSelector((state: RootState) => selectTodoById(state, id));
  const data = useMemo(
    () => ({
      ...todo,
      dueDate: todo.dueTs ? new Date(todo.dueTs) : null,
      completed: todo.completedTs !== null,
    }),
    [todo]
  );
  const dispatch = useDispatch();
  const handleContentUpdate = useCallback(
    (update: TodoUpdate) => {
      dispatch(todoContentUpdated(id, update));
    },
    [dispatch, id]
  );
  const handleSetComplete = useCallback((completed: boolean) => {
    if (completed) {
      dispatch(todoCompleted(id));
    } else {
      dispatch(todoUncompleted(id));
    }
  }, [dispatch, id]);
  const handleTagAddition = useCallback(
    (tag: string) => {
      dispatch(tagAddedToTodo(id, tag));
    },
    [dispatch, id]
  );
  const handleTagRemoval = useCallback(
    (tag: string) => {
      dispatch(tagRemovedFromTodo(id, tag));
    },
    [dispatch, id]
  );
  return { data, handleContentUpdate, handleSetComplete, handleTagAddition, handleTagRemoval };
}
