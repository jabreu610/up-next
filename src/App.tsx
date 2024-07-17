import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectActiveTodos, todoAdded, todoTouched } from "./todos";
import Todo from "./Todo/Todo";
import { createSelector } from "@reduxjs/toolkit";
import { Id, Nullable } from "./util";

const selectActiveTodoIds = createSelector([selectActiveTodos], (todos) =>
  todos.map(({ id }) => (
    id
  ))
);

const selectNewlyAddedTodoId = createSelector([selectActiveTodos], 
  (todos) => todos.find(todo => todo.createdTs === todo.updatedTs)?.id ?? null
)

export default function App() {
  const todos = useSelector(selectActiveTodoIds);
  const recentlyAddedTodoId = useSelector(selectNewlyAddedTodoId);
  const [selected, setSelected] = useState<typeof recentlyAddedTodoId>(null);
  const dispatch = useDispatch();

  const handleAddTodo = useCallback(() => {
    dispatch(todoAdded({ content: "", notes: "", tags: [], dueTs: null }));
  }, [dispatch]);

  const handleSelect = useCallback((id: Nullable<Id>) => setSelected(id), []);

  useEffect(() => {
    if (recentlyAddedTodoId) {
      setSelected(recentlyAddedTodoId);
      dispatch(todoTouched(recentlyAddedTodoId));
    }
  }, [recentlyAddedTodoId, dispatch]);
  
  return (
    <>
      <h1>Up Next</h1>
      <ul>
        {todos.map((todoId) => (
          <Todo key={todoId} selected={selected === todoId} id={todoId} onSelect={handleSelect}/>
        ))}
      </ul>
      <button onClick={handleAddTodo}>New Todo</button>
    </>
  );
}
