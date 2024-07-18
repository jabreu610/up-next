import {
  ComponentProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveTodos,
  todoAdded,
  todoArchived,
  todoTouched,
} from "./todos";
import Todo, { TodoRef } from "./Todo/Todo";
import { createSelector } from "@reduxjs/toolkit";
import { Id, Nullable } from "./util";
import style from "./App.module.css";
import classNames from "classnames/bind";
import FloatingControls from "./FloatingControls/FloatingControls";

const cx = classNames.bind(style);

const selectActiveTodoIds = createSelector([selectActiveTodos], (todos) =>
  todos.map(({ id }) => id)
);

const selectNewlyAddedTodoId = createSelector(
  [selectActiveTodos],
  (todos) => todos.find((todo) => todo.createdTs === todo.updatedTs)?.id ?? null
);

export default function App() {
  const todos = useSelector(selectActiveTodoIds);
  const recentlyAddedTodoId = useSelector(selectNewlyAddedTodoId);
  const [selected, setSelected] = useState<typeof recentlyAddedTodoId>(null);
  const selectedTodoRef = useRef<TodoRef>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dispatch = useDispatch();

  const handleAddTodo = useCallback(() => {
    dispatch(todoAdded({ content: "", notes: "", tags: [], dueTs: null }));
  }, [dispatch]);

  const handleSelect = useCallback((id: Nullable<Id>) => setSelected(id), []);

  useLayoutEffect(() => {
    if (recentlyAddedTodoId) {
      setSelected(recentlyAddedTodoId);
      dispatch(todoTouched(recentlyAddedTodoId));
      if (selectedTodoRef.current) {
        selectedTodoRef.current.focus();
      }
    }
  }, [recentlyAddedTodoId, dispatch]);

  useEffect(() => {
    if (listRef.current && selected) {
      const listEl = listRef.current;
      let focusLost = false;
      const trackActiveElement = () => {
        focusLost = true;
        setTimeout(() => {
          focusLost = false;
        }, 0);
      };
      const handleLightDismiss = (e: MouseEvent) => {
        const target = e.target as Element;
        if (target.tagName === "BUTTON") {
          return;
        } else if (listEl.contains(target) && focusLost) {
          e.stopPropagation();
        } else if (!listEl.contains(target) && !focusLost) {
          setSelected(null);
        }
      };
      document.addEventListener("focusout", trackActiveElement);
      document.addEventListener("click", handleLightDismiss, { capture: true });
      return () => {
        document.removeEventListener("focusout", trackActiveElement);
        document.removeEventListener("click", handleLightDismiss, {
          capture: true,
        });
      };
    }
  }, [selected]);

  const handleArchive = useCallback(() => {
    if (selected) {
      dispatch(todoArchived(selected));
      setSelected(null);
    }
  }, [selected, dispatch]);

  const floatingControlsConfig: ComponentProps<
    typeof FloatingControls
  >["config"] = useMemo(() => {
    return [
      {
        label: "Delete",
        onClick: handleArchive,
      },
    ];
  }, [handleArchive]);

  return (
    <div className={cx("layout")}>
      <h1>Up Next</h1>
      <ul ref={listRef} role="list" className={cx("list")}>
        {todos.map((todoId) => (
          <Todo
            ref={
              recentlyAddedTodoId === todoId ||
              (!recentlyAddedTodoId && selected === todoId)
                ? selectedTodoRef
                : undefined
            }
            key={todoId}
            selected={selected === todoId || recentlyAddedTodoId === todoId}
            id={todoId}
            onSelect={handleSelect}
          />
        ))}
      </ul>
      <button onClick={handleAddTodo}>New Todo</button>
      <FloatingControls config={floatingControlsConfig} selectedId={selected} />
    </div>
  );
}