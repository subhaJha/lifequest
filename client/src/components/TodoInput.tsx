type Props = {
  text: string;
  setText: React.Dispatch<
    React.SetStateAction<string>
  >;
  addTodo: () => void;
};

function TodoInput({
  text,
  setText,
  addTodo,
}: Props) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter todo..."
        value={text}
        onChange={(e) =>
          setText(e.target.value)
        }
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none text-black"
      />

      <button
        onClick={addTodo}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Add
      </button>
    </div>
  );
}

export default TodoInput;