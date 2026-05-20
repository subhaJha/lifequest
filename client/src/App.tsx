import { useEffect, useState } from "react";
import axios from "axios";

import TodoInput from "./components/TodoInput";
import TodoItem from "./components/TodoItem";

function App() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // FETCH TODOS
  const fetchTodos = async () => {
    const res = await axios.get("http://localhost:5000/todos");
    setTodos(res.data);
  };

  // ADD TODO
  const addTodo = async () => {
    if (!text) return;

    await axios.post("http://localhost:5000/todos", {
      text,
    });

    setText("");
    fetchTodos();
  };

  // DELETE TODO
  const deleteTodo = async (id: string) => {
    await axios.delete(`http://localhost:5000/todos/${id}`);

    fetchTodos();
  };

  // TOGGLE COMPLETE
  const toggleComplete = async (
    id: string,
    completed: boolean
  ) => {
    await axios.put(`http://localhost:5000/todos/${id}`, {
      completed: !completed,
    });

    fetchTodos();
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div
      className={`min-h-screen flex justify-center items-center p-6 transition-all ${
        darkMode
          ? "bg-black text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`shadow-xl rounded-2xl p-6 w-full max-w-md ${
          darkMode
            ? "bg-gray-900"
            : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Todo App
          </h1>

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="border px-3 py-1 rounded-lg"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <TodoInput
          text={text}
          setText={setText}
          addTodo={addTodo}
        />

        <div className="space-y-3 mt-5">
          {todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              darkMode={darkMode}
              deleteTodo={deleteTodo}
              toggleComplete={toggleComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;