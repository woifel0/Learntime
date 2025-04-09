import { useState, useEffect, useRef } from 'react';

export function useTimer(initialTime = 0) {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  
  // Start the timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      
      // Clear any existing timers
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      // Set up the interval
      const startTime = Date.now() - time * 1000; // adjust for existing time
      
      timerRef.current = window.setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setTime(elapsedSeconds);
      }, 1000);
    }
  };
  
  // Pause the timer
  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Stop the timer and reset
  const stopTimer = () => {
    setIsRunning(false);
    setTime(0);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Reset the timer to 0 but maintain running state
  const resetTimer = () => {
    setTime(0);
    if (isRunning) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      // Restart from 0 if it was running
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setTime(elapsedSeconds);
      }, 1000);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return {
    time,
    isRunning,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setTime,
  };
}
