import { useState, useEffect } from "react";
import ProgramSelector from "./components/ProgramSelector";
import Timer from "./components/Timer";
import PinInput from "./components/PinInput";
import SavedPrograms from "./components/SavedPrograms";

function Settings({ settings, setSettings }) {
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (window.api) {
      const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
      if (window.api[setterName]) {
        window.api[setterName](value);
      }
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-700 text-left">
      <h3 className="text-lg font-semibold mb-3 text-center">Settings</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.MinimizeToTray}
            onChange={(e) => handleSettingChange('MinimizeToTray', e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600 bg-gray-800 border-gray-600 rounded"
          />
          <span>Minimize to tray on close</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.StartOnLogin}
            onChange={(e) => handleSettingChange('StartOnLogin', e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600 bg-gray-800 border-gray-600 rounded"
          />
          <span>Start automatically on login</span>
        </label>
        <label className={`flex items-center gap-3 cursor-pointer ${!settings.StartOnLogin ? 'opacity-50' : ''}`}>
          <input
            type="checkbox"
            checked={settings.StartMinimized}
            onChange={(e) => handleSettingChange('StartMinimized', e.target.checked)}
            disabled={!settings.StartOnLogin}
            className="form-checkbox h-5 w-5 text-blue-600 bg-gray-800 border-gray-600 rounded"
          />
          <span>Start minimized in tray</span>
        </label>
      </div>
    </div>
  );
}

export default function App() {
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  
  const [duration, setDuration] = useState(0);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  
  const [isBlocking, setIsBlocking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [blockedPrograms, setBlockedPrograms] = useState([]);

  const [settings, setSettings] = useState({
    MinimizeToTray: false,
    StartOnLogin: false,
    StartMinimized: false,
  });

  useEffect(() => {
    if (window.api) {
      window.api.getPrograms().then(setSavedPrograms);
      Promise.all([
        window.api.getMinimizeToTray(),
        window.api.getStartOnLogin(),
        window.api.getStartMinimized(),
      ]).then(([minimize, startOnLogin, startMinimized]) => {
        setSettings({
          MinimizeToTray: minimize,
          StartOnLogin: startOnLogin,
          StartMinimized: startMinimized,
        });
      });
    }
  }, []);

  const updateSavedPrograms = () => {
    const newPrograms = [...new Set([...savedPrograms, ...selectedPrograms])];
    setSavedPrograms(newPrograms);
    if (window.api) {
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
        setSelectedPrograms([]);
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
    updateSavedPrograms();
    if (window.api) {
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
    if (window.api) {
      const result = await window.api.stopBlock(pin);
      if (result.success) {
        setMessage("Blocking stopped successfully.");
      } else {
        setMessage(result.message || "Failed to stop blocking.");
      }
      setPin("");
    }
  };

  const availableSavedPrograms = savedPrograms.filter(p => !selectedPrograms.includes(p));

  return (
    <div className="bg-neutral-900 text-white min-h-screen p-6 text-center">
      <div className="max-w-2xl mx-auto">
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
            <button onClick={stop} className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Stop Blocking with PIN
            </button>
          </div>
        ) : (
          <>
            <ProgramSelector selectedPrograms={selectedPrograms} setSelectedPrograms={setSelectedPrograms} />
            <Timer onChange={setDuration} />
            <PinInput onChange={setPin} />
            <button onClick={start} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full">
              Start Blocking
            </button>
            <SavedPrograms programs={availableSavedPrograms} onSelect={handleSelectFromSaved} />
            <Settings settings={settings} setSettings={setSettings} />
          </>
        )}

        {message && (
          <p className={`mt-4 ${message.includes("Incorrect") || message.includes("Please") ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
