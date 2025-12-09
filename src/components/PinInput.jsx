import { useState } from "react";

function PinInput({ onChange }) {
  const [pin, setPin] = useState("");

  const handleChange = (e) => {
    setPin(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="block mb-1">PIN:</label>
      <input
        type="password"
        value={pin}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-full text-black"
      />
    </div>
  );
}

export default PinInput;
