import { useState } from "react";

function ProgramSelector({ onProgramsChange }) {
  const [currentProgram, setCurrentProgram] = useState("");
  const [programs, setPrograms] = useState([]);

  const handleAddProgram = () => {
    let programName = currentProgram.trim();
    if (programName && !programs.includes(programName)) {
      // Automatically append .exe if not present
      if (!programName.toLowerCase().endsWith(".exe")) {
        programName += ".exe";
      }
      const newPrograms = [...programs, programName];
      setPrograms(newPrograms);
      onProgramsChange(newPrograms); // Notify parent component
      setCurrentProgram(""); // Clear input field
    }
  };

  const handleRemoveProgram = (programToRemove) => {
    const newPrograms = programs.filter(p => p !== programToRemove);
    setPrograms(newPrograms);
    onProgramsChange(newPrograms); // Notify parent component
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAddProgram();
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1">Program(s) to block (e.g., chrome):</label>
      <div className="flex">
        <input
          type="text"
          value={currentProgram}
          onChange={(e) => setCurrentProgram(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border px-2 py-1 rounded-l w-full text-black"
          placeholder="Type a program name and press Enter"
        />
        <button
          onClick={handleAddProgram}
          className="bg-green-600 text-white px-4 py-1 rounded-r hover:bg-green-700"
        >
          Add
        </button>
      </div>
      <ul className="mt-2">
        {programs.map(p => (
          <li key={p} className="flex justify-between items-center bg-gray-800 p-2 rounded mb-1">
            <span>{p}</span>
            <button
              onClick={() => handleRemoveProgram(p)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProgramSelector;
