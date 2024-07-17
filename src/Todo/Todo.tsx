import {
  forwardRef,
  MouseEventHandler,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTodoById } from "../hooks/useTodoById";
import { Id, Nullable } from "../util";
import styles from "./Todo.module.css";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

type TodoProps = {
  id: Id;
  selected?: boolean;
  onSelect: (id: Nullable<Id>) => void;
};

export type TodoRef = {
  focus(): void;
};

const Todo = forwardRef<TodoRef, TodoProps>(function Todo(
  { id, selected, onSelect },
  ref
) {
  const containerRef = useRef<HTMLLIElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const { data, handleContentUpdate } = useTodoById(id);
  const [contentInputValue, setContentInputValue] = useState(data.content);
  const [notesInputValue, setNotesInputValue] = useState(data.notes ?? "");

  useImperativeHandle(ref, () => {
    return {
      focus() {
        if (contentInputRef.current) {
          contentInputRef.current.focus();
        }
      },
    };
  });

  const handleContentCommit = useCallback(() => {
    handleContentUpdate({ content: contentInputValue });
  }, [contentInputValue, handleContentUpdate]);

  const handleNoteCommit = useCallback(() => {
    handleContentUpdate({ notes: notesInputValue });
  }, [notesInputValue, handleContentUpdate]);

  const handleSelection = useCallback<MouseEventHandler>(
    (e) => {
      console.log(e.target, document.activeElement);
      onSelect(id);
    },
    [onSelect, id]
  );

  return (
    <li
      className={cx("container", { selected })}
      onClickCapture={handleSelection}
      ref={containerRef}
    >
      <input type="checkbox" defaultChecked={data.completed} />
      {selected ? (
        <input
          className={cx("content")}
          ref={contentInputRef}
          placeholder="New Todo"
          type="text"
          value={contentInputValue}
          onChange={(e) => setContentInputValue(e.target.value)}
          onBlur={handleContentCommit}
        />
      ) : (
        <span className={cx("content", { empty: !data.content })}>
          {data.content || "New Todo"}
        </span>
      )}
      {selected && (
        <>
          {selected ? (
            <textarea
              rows={3}
              className={cx("notes")}
              value={notesInputValue}
              placeholder="Notes"
              onChange={(e) => setNotesInputValue(e.target.value)}
              onBlur={handleNoteCommit}
            />
          ) : (
            <p>{data.notes}</p>
          )}
          {data.dueDate && <p>Due: {data.dueDate.toLocaleString()}</p>}
        </>
      )}
    </li>
  );
});

export default Todo;
