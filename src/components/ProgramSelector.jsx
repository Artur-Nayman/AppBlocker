import { useState } from "react";

function ProgramSelector({ selectedPrograms, setSelectedPrograms }) {
  const [currentProgramInput, setCurrentProgramInput] = useState("");

  const handleAddProgram = () => {
    let programName = currentProgramInput.trim();
    if (programName) {
      if (!programName.toLowerCase().endsWith(".exe")) {
        programName += ".exe";
      }
      if (!selectedPrograms.includes(programName)) {
        setSelectedPrograms(prev => [...prev, programName]);
      }
      setCurrentProgramInput("");
    }
  };

  const handleBrowse = async () => {
    if (window.api && window.api.browseForPrograms) {
      const newPrograms = await window.api.browseForPrograms();
      const updatedPrograms = [...new Set([...selectedPrograms, ...newPrograms])];
      setSelectedPrograms(updatedPrograms);
    }
  };

  const handleRemoveProgram = (programToRemove) => {
    setSelectedPrograms(prev => prev.filter(p => p !== programToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProgram();
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Programs to Block in This Session:</label>
      
      <div className="flex mb-3">
        <input
          type="text"
          value={currentProgramInput}
          onChange={(e) => setCurrentProgramInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border px-2 py-1 rounded-l w-full text-black"
          placeholder="Type program name..."
        />
        <button
          onClick={handleAddProgram}
          className="bg-green-600 text-white px-4 py-1 rounded-r hover:bg-green-700"
        >
          Add
        </button>
      </div>

      <button
        onClick={handleBrowse}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 w-full mb-3"
      >
        Browse for EXE files...
      </button>

      <ul className="mt-2 min-h-[40px] max-h-40 overflow-y-auto bg-neutral-800 rounded p-2">
        {selectedPrograms.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-1">No programs selected for this session.</p>
        )}
        {selectedPrograms.map(p => (
          <li key={p} className="flex justify-between items-center bg-gray-700 p-2 rounded mb-1 last:mb-0">
            <span>{p}</span>
            <button
              onClick={() => handleRemoveProgram(p)}
              className="text-red-400 hover:text-red-600 font-bold text-lg"
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
