"use client";

import { useState, useRef, useEffect } from "react";

const CARRIERS = [
  { label: "Verizon", gateway: "@vtext.com" },
  { label: "AT&T", gateway: "@txt.att.net" },
  { label: "T-Mobile", gateway: "@tmomail.net" },
  { label: "Sprint", gateway: "@messaging.sprintpcs.com" },
];

const COLORS = [
  { label: "Neon Green (Toxic)", hex: "#39ff14" },
  { label: "Magenta (Mystery)", hex: "#ff00ff" },
  { label: "Cyan (Electric)", hex: "#00ffff" },
  { label: "Orange (Classic)", hex: "#ff9900" },
];

export default function Home() {
  const [phone, setPhone] = useState("");
  const [carrier, setCarrier] = useState(CARRIERS[0].gateway);
  const [color, setColor] = useState(COLORS[0].hex);

  const [isStarted, setIsStarted] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--liquid-color", color);
  }, [color]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const logMsg = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleStart = async () => {
    if (!phone || phone.length < 10) {
      alert("PLEASE ENTER A VALID PHONE NUMBER!");
      return;
    }

    setIsFilling(true);

    // Call out to our /api/start backend
    try {
      // We will build this API route shortly
      const res = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, carrier })
      });

      if (!res.ok) throw new Error("Failed to start server process.");

      // Wait for CSS animation
      setTimeout(() => {
        setIsStarted(true);
        logMsg(`SYSTEM INITIALIZED.`);
        logMsg(`TARGET: ${phone}${carrier}`);
        logMsg(`MARATHON DURATION: 5 HOURS`);
        logMsg(`AWAITING FIRST INTERVAL...`);
      }, 2500);

    } catch (error) {
      console.error(error);
      alert("SERVER ERROR. TRY AGAIN.");
      setIsFilling(false);
    }
  };

  return (
    <div className="w-full max-w-md p-5 text-center font-pixel">
      <header className="mb-10">
        <h1 className="text-accent text-[24px] mb-2" style={{ textShadow: "2px 2px 0px #000, 4px 4px 0px var(--text-main)" }}>
          Shot O&apos;Clock
        </h1>
        <p className="text-textMuted text-[10px] tracking-[2px]">5-Hour Marathon</p>
      </header>

      <main>
        {/* Pixel Cup */}
        <div className="flex justify-center mb-10">
          <div className="pixel-cup w-[100px] h-[120px] shadow-pixel-cup">
            <div className={`cup-liquid ${isFilling || isStarted ? 'fill' : ''}`}></div>
            <div className="cup-highlight"></div>
          </div>
        </div>

        {/* Setup Panel (Hidden if Started) */}
        {!isStarted && (
          <div className="bg-panelBg p-5 border-4 border-textMuted rounded-lg shadow-pixel-panel">
            <label className="block text-[10px] text-textMuted text-left mb-2">Phone Number:</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5551234567"
              className="w-full bg-black text-textMain border-2 border-textMuted p-2.5 text-[12px] mb-4 outline-none focus:border-accent"
              disabled={isFilling}
            />

            <label className="block text-[10px] text-textMuted text-left mb-2">Carrier:</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full bg-black text-textMain border-2 border-textMuted p-2.5 text-[12px] mb-4 outline-none focus:border-accent"
              disabled={isFilling}
            >
              {CARRIERS.map(c => (
                <option key={c.gateway} value={c.gateway}>{c.label}</option>
              ))}
            </select>

            <label className="block text-[10px] text-textMuted text-left mb-2">Drink Color:</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-black text-textMain border-2 border-textMuted p-2.5 text-[12px] mb-6 outline-none focus:border-accent"
              disabled={isFilling}
            >
              {COLORS.map(c => (
                <option key={c.hex} value={c.hex}>{c.label}</option>
              ))}
            </select>

            <button
              onClick={handleStart}
              disabled={isFilling}
              className="w-full bg-accent text-white border-4 border-white p-4 text-[16px] cursor-pointer shadow-pixel-btn active:translate-y-1 active:shadow-pixel-btn-active hover:bg-[#ff3399]"
              style={{ textShadow: "2px 2px 0 #000" }}
            >
              {isFilling ? "FILLING..." : "START"}
            </button>
          </div>
        )}

        {/* Status Panel (Visible when Started) */}
        {isStarted && (
          <div className="bg-panelBg p-5 border-4 border-textMuted rounded-lg shadow-pixel-panel">
            <h2 className="text-accent text-[16px] status-blink mb-5">STATUS: DRINKING</h2>
            <div
              ref={logContainerRef}
              className="bg-black border-2 border-textMuted p-2.5 h-[150px] overflow-y-auto text-[8px] text-left leading-relaxed flex flex-col gap-2"
            >
              {logs.length === 0 && <p className="text-liquid-color">Waiting for server hook...</p>}
              {logs.map((log, i) => (
                <p key={i} className="text-[var(--liquid-color)] border-b border-dashed border-[#333] pb-1">
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
