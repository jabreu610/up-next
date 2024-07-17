import { useCallback, useEffect, useRef, useState } from "react";
import { useTodoById } from "../hooks/useTodoById";
import { Id, Nullable } from "../util";

type TodoProps = {
  id: Id;
  selected?: boolean;
  onSelect: (id: Nullable<Id>) => void;
};

export default function Todo({ id, selected, onSelect }: TodoProps) {
  const containerRef = useRef<HTMLLIElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const { data, handleContentUpdate } = useTodoById(id);
  const [contentInputValue, setContentInputValue] = useState(data.content);
  const [notesInputValue, setNotesInputValue] = useState(data.notes ?? "");

  useEffect(() => {
    if (selected && contentInputRef.current) {
      contentInputRef.current.focus();
    }
  }, [selected]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("focusin", () => {
        if (!selected) {
          onSelect(id);
        }
      });
      container.addEventListener("focusout", () => {
        setTimeout(() => {
          if (!container.contains(document.activeElement)) {
            onSelect(null);
          }
        });
      });
    }
  }, [selected, onSelect, id]);

  const handleContentCommit = useCallback(() => {
    handleContentUpdate({ content: contentInputValue });
  }, [contentInputValue, handleContentUpdate]);

  const handleNoteCommit = useCallback(() => {
    handleContentUpdate({ notes: notesInputValue });
  }, [notesInputValue, handleContentUpdate]);

  const handleCommit = useCallback(() => {
    console.log("commit");
  }, []);

  const handleSelection = useCallback(() => {
    onSelect(id);
  }, [onSelect, id]);

  return (
    <li onClick={handleSelection} ref={containerRef} onBlur={handleCommit}>
      <input type="checkbox" defaultChecked={data.completed} />
      {selected ? (
        <input
          ref={contentInputRef}
          type="text"
          value={contentInputValue}
          onChange={(e) => setContentInputValue(e.target.value)}
          onBlur={handleContentCommit}
        />
      ) : (
        <span>{data.content ?? "New Todo"}</span>
      )}
      {selected && (
        <>
          {selected ? (
            <textarea
              value={notesInputValue}
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
}
