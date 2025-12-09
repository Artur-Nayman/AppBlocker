import { useState, useEffect } from "react";

function Timer({ onChange }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // This effect calls the parent's onChange whenever a time unit changes
  useEffect(() => {
    const totalSeconds = (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);
    onChange(totalSeconds);
  }, [hours, minutes, seconds, onChange]);

  const handleInputChange = (setter) => (e) => {
    // Allow empty input but treat it as 0 for calculation
    const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
    // Prevent negative numbers and non-numeric input
    if (value === '' || (Number.isInteger(value) && value >= 0)) {
      setter(value);
    }
  };
  
  const handleBlur = (setter, value) => (e) => {
    if (value === '') {
      setter(0);
    }
  }

  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Set Blocking Duration:</label>
      <div className="flex justify-center gap-4">
        {/* Hours */}
        <div className="flex-1">
          <label className="block text-sm mb-1 text-gray-400">Hours</label>
          <input
            type="number"
            value={hours}
            onChange={handleInputChange(setHours)}
            onBlur={handleBlur(setHours, hours)}
            className="border px-2 py-1 rounded w-full text-black text-center"
            min="0"
          />
        </div>
        {/* Minutes */}
        <div className="flex-1">
          <label className="block text-sm mb-1 text-gray-400">Minutes</label>
          <input
            type="number"
            value={minutes}
            onChange={handleInputChange(setMinutes)}
            onBlur={handleBlur(setMinutes, minutes)}
            className="border px-2 py-1 rounded w-full text-black text-center"
            min="0"
            max="59"
          />
        </div>
        {/* Seconds */}
        <div className="flex-1">
          <label className="block text-sm mb-1 text-gray-400">Seconds</label>
          <input
            type="number"
            value={seconds}
            onChange={handleInputChange(setSeconds)}
            onBlur={handleBlur(setSeconds, seconds)}
            className="border px-2 py-1 rounded w-full text-black text-center"
            min="0"
            max="59"
          />
        </div>
      </div>
    </div>
  );
}

export default Timer;
