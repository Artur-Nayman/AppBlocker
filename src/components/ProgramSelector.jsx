// src/components/ProgramSelector.jsx
import { useState } from "react";

function ProgramSelector({ onChange }) {
  const [program, setProgram] = useState("");

  const handleChange = (e) => {
    setProgram(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="block mb-1">Program name (e.g., chrome or chrome.exe):</label>
      <input
        type="text"
        value={program}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-full text-black"
      />
    </div>
  );
}

export default ProgramSelector;
