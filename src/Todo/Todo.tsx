import {
  ChangeEventHandler,
  forwardRef,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
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
  autoFucus?: boolean;
  tabIndex?: number;
};

const Todo = forwardRef<HTMLLIElement, TodoProps>(function Todo(
  { id, selected, onSelect, autoFucus, tabIndex },
  ref
) {
  const containerRef = useRef<HTMLLIElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const { data, handleContentUpdate, handleSetComplete } = useTodoById(id);
  const [contentInputValue, setContentInputValue] = useState(data.content);
  const [notesInputValue, setNotesInputValue] = useState(data.notes ?? "");

  useImperativeHandle(ref, () => {
    return containerRef.current!;
  });

  const handleContentCommit = useCallback(() => {
    handleContentUpdate({ content: contentInputValue });
  }, [contentInputValue, handleContentUpdate]);

  const handleNoteCommit = useCallback(() => {
    handleContentUpdate({ notes: notesInputValue });
  }, [notesInputValue, handleContentUpdate]);

  const handleSelection = useCallback<MouseEventHandler>(
    (e) => {
      // if target is an input of type checkbox, don't select the todo
      if (
        (e.target instanceof HTMLInputElement &&
          e.target.type === "checkbox") ||
        (e.target instanceof HTMLLabelElement &&
          e.target.firstChild instanceof HTMLInputElement &&
          e.target.firstChild.type === "checkbox")
      ) {
        return;
      }
      onSelect(id);
    },
    [onSelect, id]
  );

  const handleReturnPress = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
        onSelect(null);
      }
    },
    [onSelect]
  );

  const handleCheckboxChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >(
    (e) => {
      handleSetComplete(e.target.checked);
    },
    [handleSetComplete]
  );

  useLayoutEffect(() => {
    if (selected && containerRef.current) {
      const entry = containerRef.current;
      let placeholder: HTMLLIElement;
      const token = setTimeout(() => {
        const { top, left, height } = entry.getBoundingClientRect();
        placeholder = new HTMLLIElement();
        placeholder.style.height = `${height}px`;
        entry.insertAdjacentElement("beforebegin", placeholder);
        entry.style.position = "absolute";
        entry.style.top = `${top}px`;
        entry.style.left = `${left}px`;
        entry.style.right = "0";
      }, 0);
      return () => {
        clearTimeout(token);
        placeholder?.remove();
        entry.style.position = "static";
        entry.style.top = "";
        entry.style.left = "";
        entry.style.right = "";
      };
    }
  }, [selected]);

  return (
    <li
      className={cx("container", { selected })}
      onClick={handleSelection}
      ref={containerRef}
    >
      <label>
        <input
          tabIndex={tabIndex ?? (selected ? 0 : -1)}
          type="checkbox"
          onChange={handleCheckboxChange}
          defaultChecked={data.completed}
        />
      </label>
      {selected ? (
        <input
          autoFocus={autoFucus}
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
