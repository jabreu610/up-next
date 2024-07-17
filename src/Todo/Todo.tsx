import {
  forwardRef,
  KeyboardEventHandler,
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
import GrowingTextArea from "./GrowingTextArea";

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

  const handleSelection = useCallback<MouseEventHandler>(() => {
    onSelect(id);
  }, [onSelect, id]);

  const handleReturnPress = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
        onSelect(null);
      }
    },
    [onSelect]
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
          onKeyUp={handleReturnPress}
          enterKeyHint="done"
        />
      ) : (
        <span className={cx("content", { empty: !data.content })}>
          {data.content || "New Todo"}
        </span>
      )}
      {selected && (
        <>
          <GrowingTextArea
            className={cx("notes")}
            value={notesInputValue}
            placeholder="Notes"
            onChange={(e) => setNotesInputValue(e.target.value)}
            onBlur={handleNoteCommit}
          />
          {data.dueDate && <p>Due: {data.dueDate.toLocaleString()}</p>}
        </>
      )}
    </li>
  );
});

export default Todo;