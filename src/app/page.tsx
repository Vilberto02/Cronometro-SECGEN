
'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getCurrentWindow } from "@tauri-apps/api/window";

const DEFAULT_TIME_SECONDS = 5 * 60; // 5 minutes

export default function ChronoKeysPage() {
  const [initialTime, setInitialTime] = useState<number>(DEFAULT_TIME_SECONDS);
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  
  const [configuringMinutes, setConfiguringMinutes] = useState<number>(Math.floor(initialTime / 60));
  const [configuringSeconds, setConfiguringSeconds] = useState<number>(initialTime % 60);
  const [focusedSegment, setFocusedSegment] = useState<'minutes' | 'seconds'>('minutes');
  const [isHidden, setIsHidden] = useState<boolean>(false)

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSaveConfiguration = useCallback(() => {
    const newTimeInSeconds = configuringMinutes * 60 + configuringSeconds;
    if (newTimeInSeconds >= 0) {
      setInitialTime(newTimeInSeconds);
      setTimeLeft(newTimeInSeconds);
      setIsRunning(false); 
    }
    setIsConfiguring(false);
  }, [configuringMinutes, configuringSeconds]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const arrowKey = event.key; 

      if (isConfiguring) {
        event.preventDefault(); 
        if (arrowKey === 'ArrowUp') {
          if (focusedSegment === 'minutes') {
            setConfiguringMinutes(m => Math.min(99, m + 1));
          } else {
            setConfiguringSeconds(s => Math.min(59, s + 1));
          }
        } else if (arrowKey === 'ArrowDown') {
          if (focusedSegment === 'minutes') {
            setConfiguringMinutes(m => Math.max(0, m - 1));
          } else {
            setConfiguringSeconds(s => Math.max(0, s - 1));
          }
        } else if (arrowKey === 'ArrowLeft' || arrowKey === 'ArrowRight') {
          setFocusedSegment(s => s === 'minutes' ? 'seconds' : 'minutes');
        } else if (key === 'f' || arrowKey === 'Enter') {
          handleSaveConfiguration();
        } else if (arrowKey === 'Escape') {
          setIsConfiguring(false);
        } else if (/^[0-9]$/.test(key)) {
          const digit = parseInt(key);
          if (focusedSegment === 'minutes') {
            setConfiguringMinutes(prevMinutes => {
              const tens = prevMinutes % 10;
              let newValue = tens * 10 + digit;
              if (newValue > 99) newValue = digit; 
              return Math.min(99, newValue);
            });
          } else { 
            setConfiguringSeconds(prevSeconds => {
              const tens = prevSeconds % 10;
              let newValue = tens * 10 + digit;
              if (newValue > 59) newValue = digit; 
              return Math.min(59, newValue); 
            });
          }
        }
        return; 
      }

      if (key === 'i') {
        setIsRunning((prevIsRunning) => {
          if (!prevIsRunning && timeLeft === 0 && initialTime > 0) {
            setTimeLeft(initialTime); 
          }
          return !prevIsRunning;
        });
      } else if (key === 'r' && !isConfiguring) {
        if (initialTime > 0 || timeLeft > 0) { // Allow reset even if initialTime was 0 but timeLeft became >0 (should not happen with current logic but safe)
           setIsRunning(false);
           setTimeLeft(initialTime);
        }
      } else if (key === 'f') {
        setIsRunning(false); 
        setIsConfiguring(true);
      } else if (key === 'm'){
        setIsHidden(!isHidden)
      } else if (key === 'x') {
        getCurrentWindow().close();
      }
    },
    [isConfiguring, timeLeft, initialTime, focusedSegment, handleSaveConfiguration, isHidden]
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false); 
    }
  }, [isRunning, timeLeft]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (isConfiguring) {
      setConfiguringMinutes(Math.floor(initialTime / 60));
      setConfiguringSeconds(initialTime % 60);
      setFocusedSegment('minutes');
    }
  }, [isConfiguring, initialTime]);
  
  let statusMessage: string;
  if (isConfiguring) {
    statusMessage = "Ingrese el nuevo tiempo. Use ↑↓ y números. ←→ para cambiar segmento. 'F'/Enter para guardar.";
  } else {
    if (isRunning) {
      statusMessage = "Iniciado... Presione 'I' para pausar | 'R' para reiniciar | 'M' para ocultar | 'X' para cerrar.";
    } else { 
      if (timeLeft === 0) {
        if (initialTime === 0) { 
          statusMessage = "Presione 'F' para configurar un tiempo, luego 'I' para iniciar.";
        } else { 
          statusMessage = "¡Tiempo agotado! Presione 'F' para reconfigurar | 'I' o 'R' para reiniciar.";
        }
      } else if (timeLeft < initialTime) { 
        statusMessage = "Pausado. Presione 'I' para continuar | 'F' para configurar | 'R' para reiniciar.";
      } else { // timeLeft === initialTime
         if (initialTime === 0) {
            statusMessage = "Presione 'F' para configurar un tiempo, luego 'I' para iniciar.";
         } else {
            statusMessage = "Presione 'I' para iniciar | 'F' para configurar | 'R' para reiniciar | 'M' para ocultar | 'X' para cerrar.";
         }
      }
    }
  }

  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center p-4 selection:bg-accent selection:text-accent-foreground",
        "bg-background text-foreground font-body"
      )}
      data-tauri-drag-region
    >
      {!isHidden ? (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md">
          <h1 className="text-2xl font-headline text-foreground">Cronómetro</h1>
        </div>
      ) : (
        ""
      )}

      {isConfiguring ? (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div
            className="flex items-center justify-center text-9xl font-bold text-foreground tabular-nums"
            style={{ fontSize: "clamp(4rem, 18vw, 10rem)" }}
          >
            <span
              className={cn(
                "px-2 py-1 rounded cursor-default",
                focusedSegment === "minutes" &&
                  "bg-accent text-accent-foreground ring-2 ring-accent-foreground outline-none"
              )}
              onClick={() => setFocusedSegment("minutes")}
              tabIndex={0}
              onFocus={() => setFocusedSegment("minutes")}
            >
              {String(configuringMinutes).padStart(2, "0")}
            </span>
            <span className="mx-1">:</span>
            <span
              className={cn(
                "px-2 py-1 rounded cursor-default",
                focusedSegment === "seconds" &&
                  "bg-accent text-accent-foreground ring-2 ring-accent-foreground outline-none"
              )}
              onClick={() => setFocusedSegment("seconds")}
              tabIndex={0}
              onFocus={() => setFocusedSegment("seconds")}
            >
              {String(configuringSeconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center animate-fadeIn">
          <h2
            className="text-9xl font-bold text-foreground tabular-nums"
            style={{ fontSize: "clamp(4rem, 20vw, 12rem)" }}
          >
            {formatTime(timeLeft)}
          </h2>
        </div>
      )}

      <footer className="absolute bottom-5 text-center text-sm text-foreground px-4">
        {!isHidden ? <p>{statusMessage}</p> : ""}
        <p className="mt-2">© Unidad de Informática - SECGEN</p>
      </footer>

      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        [tabindex="0"]:focus {
          outline: none;
        }
      `}</style>
    </main>
  );
}
