import { useState, useEffect } from "react";
import ProgramSelector from "./components/ProgramSelector";
import Timer from "./components/Timer";
import PinInput from "./components/PinInput";
import SavedPrograms from "./components/SavedPrograms";

export default function App() {
  // State for the complete list of all programs ever added
  const [savedPrograms, setSavedPrograms] = useState([]);
  // State for programs selected for the current blocking session
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  
  const [duration, setDuration] = useState(0);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  
  const [isBlocking, setIsBlocking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [blockedPrograms, setBlockedPrograms] = useState([]);

  // Load saved programs from storage on startup
  useEffect(() => {
    if (window.api && window.api.getPrograms) {
      window.api.getPrograms().then(setSavedPrograms);
    }
  }, []);

  // When blocking starts, update the main saved list with any new programs
  const updateSavedPrograms = () => {
    const newPrograms = [...new Set([...savedPrograms, ...selectedPrograms])];
    setSavedPrograms(newPrograms);
    if (window.api && window.api.setPrograms) {
      window.api.setPrograms(newPrograms);
    }
  };

  const handleSelectFromSaved = (program) => {
    if (!selectedPrograms.includes(program)) {
      setSelectedPrograms(prev => [...prev, program]);
    }
  };

  useEffect(() => {
    const handleBlockingState = (event, { isBlocking, duration, programs }) => {
      setIsBlocking(isBlocking);
      if (isBlocking) {
        setCountdown(duration);
        setBlockedPrograms(programs);
        setMessage("");
        setSelectedPrograms([]); // Clear selection after starting
      } else {
        setCountdown(0);
        setBlockedPrograms([]);
        setMessage("Blocking has been stopped.");
      }
    };

    if (window.api && window.api.onBlockingState) {
      window.api.onBlockingState(handleBlockingState);
    }

    return () => {
      if (window.api && window.api.removeBlockingStateListener) {
        window.api.removeBlockingStateListener(handleBlockingState);
      }
    };
  }, []);

  useEffect(() => {
    let timerId;
    if (isBlocking && countdown > 0) {
      timerId = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isBlocking, countdown]);

  const start = () => {
    setMessage("");

    if (selectedPrograms.length === 0) {
      setMessage("Please select at least one program to block.");
      return;
    }
    if (duration <= 0) {
      setMessage("Timer must be set to a value greater than 0.");
      return;
    }
    if (!pin.trim()) {
      setMessage("Please enter a PIN.");
      return;
    }

    updateSavedPrograms(); // Update the master list

    if (window.api && window.api.startBlock) {
      window.api.startBlock({
        processNames: selectedPrograms,
        durationMs: duration * 1000,
        pin
      });
    } else {
      setMessage("Electron API is not available.");
    }
  };

  const stop = async () => {
    if (!pin) {
      setMessage("Please enter a PIN to stop blocking.");
      return;
    }
    if (window.api && window.api.stopBlock) {
      const result = await window.api.stopBlock(pin);
      if (result.success) {
        setMessage("Blocking stopped successfully.");
      } else {
        setMessage(result.message || "Failed to stop blocking.");
      }
      setPin("");
    }
  };

  // Filter out programs that are already selected for the current session
  const availableSavedPrograms = savedPrograms.filter(p => !selectedPrograms.includes(p));

  return (
    <div className="bg-neutral-900 text-white min-h-screen p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">App Blocker</h1>

      {isBlocking ? (
        <div className="flex flex-col items-center">
          <p className="text-xl mb-2">Blocking is active for:</p>
          <ul className="mb-4">
            {blockedPrograms.map(p => <li key={p} className="font-semibold">{p}</li>)}
          </ul>
          <p className="text-6xl font-bold mb-4">
            {new Date(countdown * 1000).toISOString().substr(11, 8)}
          </p>
          <div className="w-full max-w-xs">
            <PinInput onChange={setPin} />
          </div>
          <button
            onClick={stop}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Stop Blocking with PIN
          </button>
        </div>
      ) : (
        <>
          <ProgramSelector selectedPrograms={selectedPrograms} setSelectedPrograms={setSelectedPrograms} />
          <Timer onChange={setDuration} />
          <PinInput onChange={setPin} />
          <button
            onClick={start}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            Start Blocking
          </button>
          <SavedPrograms programs={availableSavedPrograms} onSelect={handleSelectFromSaved} />
        </>
      )}

      {message && (
        <p className={`mt-4 ${message.includes("Incorrect") || message.includes("Please") ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
