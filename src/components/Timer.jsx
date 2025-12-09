// src/components/Timer.jsx
import { useState } from "react";

function Timer({ onChange }) {
  const [seconds, setSeconds] = useState(0);

  const handleChange = (e) => {
    setSeconds(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="block mb-1">Timer (seconds):</label>
      <input
        type="number"
        value={seconds}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-full text-black"
      />
    </div>
  );
}

export default Timer;
