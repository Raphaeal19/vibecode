import React, { useState, useEffect, useRef } from "react";
import { FiRefreshCcw } from "react-icons/fi";

type TimerProps = {};

const Timer: React.FC<TimerProps> = () => {
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer
  const startTimer = () => {
    if (intervalRef.current !== null) return; // already running
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  };

  // Pause timer
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  };

  // Reset timer
  const resetTimer = () => {
    pauseTimer();
    setTime(0);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Format time (hh:mm:ss)
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex items-center bg-dark-fill-3 p-1.5 rounded group relative transition-all duration-300">
      <div className="text-white font-mono transition-all duration-300 group-hover:mr-24">
        {formatTime(time)}
      </div>

      <div className="flex items-center space-x-2 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Reset */}
        <button onClick={resetTimer} title="Reset">
          <FiRefreshCcw className="text-white cursor-pointer" />
        </button>

        {/* Start / Pause */}
        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="text-white text-sm bg-dark-fill-2 px-2 py-1 rounded"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={startTimer}
            className="text-white text-sm bg-dark-fill-2 px-2 py-1 rounded"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;
