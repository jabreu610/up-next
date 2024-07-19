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
} from "./todos";
import Todo from "./Todo/Todo";
import { createSelector } from "@reduxjs/toolkit";
import { Id, Nullable } from "./util";
import style from "./App.module.css";
import classNames from "classnames/bind";
import FloatingControls from "./FloatingControls/FloatingControls";
import { FloatingActionButton } from "./FloatingActionButton/FloatingActionButton";

const cx = classNames.bind(style);

const selectActiveTodoIds = createSelector([selectActiveTodos], (todos) =>
  todos.map(({ id }) => id)
);

const selectNewlyAddedTodoId = createSelector(
  [selectActiveTodos],
  (todos) => todos.find((todo) => todo.createdTs === todo.updatedTs)?.id ?? null
);

export default function App() {
  const activeTodos = useSelector(selectActiveTodoIds);
  const [renderedTodos, setRenderedTodos] = useState<Id[]>(activeTodos);
  const recentlyAddedTodoId = useSelector(selectNewlyAddedTodoId);
  const [selected, setSelected] = useState<typeof recentlyAddedTodoId>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dispatch = useDispatch();

  const handleAddTodo = useCallback(() => {
    dispatch(todoAdded({ content: "", notes: "", tags: [], dueTs: null }));
  }, [dispatch]);

  const handleSelect = useCallback((id: Nullable<Id>) => setSelected(id), []);

  useEffect(() => {
    if (recentlyAddedTodoId) {
      setRenderedTodos(activeTodos);
    } else {
      const timeout = setTimeout(() => {
        setRenderedTodos(activeTodos);
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [activeTodos, recentlyAddedTodoId]);

  useEffect(() => {
    if (selected && !renderedTodos.includes(selected)) {
      setSelected(null);
    }
  }, [selected, renderedTodos])

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

  useLayoutEffect(() => {
    if (recentlyAddedTodoId) {
      setSelected(recentlyAddedTodoId);
    }
  }, [recentlyAddedTodoId, dispatch, renderedTodos]);

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
        {renderedTodos.map((todoId) => (
          <Todo
            tabIndex={!selected ? 0 : undefined}
            autoFucus={recentlyAddedTodoId === todoId}
            key={todoId}
            selected={selected === todoId || recentlyAddedTodoId === todoId}
            id={todoId}
            onSelect={handleSelect}
          />
        ))}
      {recentlyAddedTodoId && (
        <Todo
          autoFucus
          key={recentlyAddedTodoId}
          selected
          id={recentlyAddedTodoId}
          onSelect={handleSelect}
        />
      )}
      </ul>
      <FloatingActionButton tabIndex={selected ? -1 : 0} onClick={handleAddTodo} />
      <FloatingControls config={floatingControlsConfig} selectedId={selected} />
    </div>
  );
}
