type Props = {
  todo: any;
  darkMode: boolean;
  deleteTodo: (id: string) => void;
  toggleComplete: (
    id: string,
    completed: boolean
  ) => void;
};

function TodoItem({
  todo,
  darkMode,
  deleteTodo,
  toggleComplete,
}: Props) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl ${
        darkMode
          ? "bg-gray-800"
          : "bg-gray-100"
      }`}
    >
      <p
        className={`flex-1 ${
          todo.completed
            ? "line-through text-gray-400"
            : ""
        }`}
      >
        {todo.text}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() =>
            toggleComplete(
              todo._id,
              todo.completed
            )
          }
          className="bg-green-500 text-white px-3 py-1 rounded-md"
        >
          {todo.completed ? "Undo" : "Done"}
        </button>

        <button
          onClick={() =>
            deleteTodo(todo._id)
          }
          className="bg-red-500 text-white px-3 py-1 rounded-md"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TodoItem;