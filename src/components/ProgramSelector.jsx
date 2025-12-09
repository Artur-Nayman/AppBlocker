import { useState, useEffect } from "react";

function ProgramSelector({ programs, setPrograms }) {
  const [currentProgramInput, setCurrentProgramInput] = useState("");

  const handleAddProgram = () => {
    let programName = currentProgramInput.trim();
    if (programName) {
      // Automatically append .exe if not present
      if (!programName.toLowerCase().endsWith(".exe")) {
        programName += ".exe";
      }
      // Add only if not already in the list
      if (!programs.includes(programName)) {
        setPrograms(prevPrograms => [...prevPrograms, programName]);
      }
      setCurrentProgramInput(""); // Clear input field
    }
  };

  const handleBrowse = async () => {
    if (window.api && window.api.browseForPrograms) {
      const newPrograms = await window.api.browseForPrograms();
      // Filter out duplicates and add new programs
      const updatedPrograms = [...new Set([...programs, ...newPrograms])];
      setPrograms(updatedPrograms);
    }
  };

  const handleRemoveProgram = (programToRemove) => {
    const updatedPrograms = programs.filter(p => p !== programToRemove);
    setPrograms(updatedPrograms);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAddProgram();
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Programs to Block:</label>
      
      {/* Input for manual entry */}
      <div className="flex mb-3">
        <input
          type="text"
          value={currentProgramInput}
          onChange={(e) => setCurrentProgramInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border px-2 py-1 rounded-l w-full text-black"
          placeholder="Type program name (e.g., chrome.exe)"
        />
        <button
          onClick={handleAddProgram}
          className="bg-green-600 text-white px-4 py-1 rounded-r hover:bg-green-700 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Button for browsing */}
      <button
        onClick={handleBrowse}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full mb-3"
      >
        Browse for EXE files...
      </button>

      {/* List of added programs */}
      <ul className="mt-2 max-h-40 overflow-y-auto bg-neutral-800 rounded p-2">
        {programs.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-2">No programs added.</p>
        )}
        {programs.map(p => (
          <li key={p} className="flex justify-between items-center bg-gray-700 p-2 rounded mb-1 last:mb-0">
            <span>{p}</span>
            <button
              onClick={() => handleRemoveProgram(p)}
              className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
              title={`Remove ${p}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProgramSelector;
