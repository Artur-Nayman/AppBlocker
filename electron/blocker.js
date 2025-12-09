import psList from "ps-list";
import { exec } from "child_process";

let interval = null;
let targetProcess = "";
let correctPin = "";
let blocking = false;
let timeoutId = null;
let onStopCallback = null; // To notify the main process when the timer ends

export function startBlocking({ processName, durationMs, pin, onStop }) {
  if (blocking) return;

  blocking = true;
  targetProcess = processName;
  correctPin = pin;
  onStopCallback = onStop; // Store the callback

  console.log(`Blocking started for ${targetProcess}.`);

  interval = setInterval(async () => {
    const list = await psList();
    const running = list.find(p => p.name.toLowerCase() === targetProcess.toLowerCase());
    if (running) {
      try {
        exec(`taskkill /IM ${targetProcess} /F`);
      } catch (error) {
        console.error(`Failed to kill process ${targetProcess}:`, error);
      }
    }
  }, 1500);

  timeoutId = setTimeout(() => {
    console.log(`Blocking duration ended for ${targetProcess}.`);
    const result = stopBlocking({ pin: correctPin, force: true });
    if (result.success && onStopCallback) {
      onStopCallback(); // Notify main.js that blocking has stopped
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
    onStopCallback = null;
    console.log("Blocking stopped successfully.");
    return { success: true, message: "Blocking stopped." };
  } else {
    console.log(`Incorrect PIN provided. Stored PIN is ${correctPin}`);
    return { success: false, message: "Incorrect PIN." };
  }
}
