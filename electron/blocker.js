import psList from "ps-list";
import { exec } from "child_process";

let interval = null;
let targetProcesses = []; // Changed from string to array
let correctPin = "";
let blocking = false;
let timeoutId = null;
let onStopCallback = null;

// processNames is now an array
export function startBlocking({ processNames, durationMs, pin, onStop }) {
  if (blocking) return;

  blocking = true;
  targetProcesses = processNames; // Store the array
  correctPin = pin;
  onStopCallback = onStop;

  console.log(`Blocking started for: ${targetProcesses.join(", ")}.`);

  interval = setInterval(async () => {
    const list = await psList();
    const lowercasedTargets = targetProcesses.map(t => t.toLowerCase());

    for (const runningProcess of list) {
      if (lowercasedTargets.includes(runningProcess.name.toLowerCase())) {
        try {
          // Use the actual process name from the list to avoid case issues
          exec(`taskkill /IM ${runningProcess.name} /F`);
        } catch (error) {
          console.error(`Failed to kill process ${runningProcess.name}:`, error);
        }
      }
    }
  }, 1500);

  timeoutId = setTimeout(() => {
    console.log(`Blocking duration ended for ${targetProcesses.join(", ")}.`);
    const result = stopBlocking({ pin: correctPin, force: true });
    if (result.success && onStopCallback) {
      onStopCallback();
    }
  }, durationMs);
}

export function stopBlocking({ pin, force = false }) {
  if (!blocking) {
    return { success: false, message: "Not currently blocking." };
  }

  if (force || pin === correctPin) {
    blocking = false;
    clearInterval(interval);
    clearTimeout(timeoutId);
    interval = null;
    timeoutId = null;
    correctPin = "";
    targetProcesses = []; // Clear the array
    onStopCallback = null;
    console.log("Blocking stopped successfully.");
    return { success: true, message: "Blocking stopped." };
  } else {
    console.log(`Incorrect PIN provided.`);
    return { success: false, message: "Incorrect PIN." };
  }
}
