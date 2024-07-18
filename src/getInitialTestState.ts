import { todos, todoAdded, todoTouched } from "./todos";

export async function getInitialTestState({ reducer }: typeof todos) {
  const mockTodos = [
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

  const state = { todos: reducer(undefined, { type: "unknown" }) };

  for (const todo of mockTodos) {
    state.todos = reducer(state.todos, todoAdded(todo));
  }
  const allIds = state.todos.ids.slice();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  for (const id of allIds) {
    state.todos = reducer(state.todos, todoTouched(id));
  }
  return state;
}
