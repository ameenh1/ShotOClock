"use client";

import { useState, useRef, useEffect } from "react";

const CARRIERS = [
  { label: "Verizon", gateway: "@vtext.com" },
  { label: "AT&T", gateway: "@txt.att.net" },
  { label: "T-Mobile", gateway: "@tmomail.net" },
  { label: "Sprint", gateway: "@messaging.sprintpcs.com" },
  { label: "Cricket", gateway: "@mms.cricketwireless.net" },
  { label: "Boost Mobile", gateway: "@smsmyboostmobile.com" },
];

const COLORS = [
  { label: "Neon Green (Toxic)", hex: "#39ff14" },
  { label: "Magenta (Mystery)", hex: "#ff00ff" },
  { label: "Cyan (Electric)", hex: "#00ffff" },
  { label: "Orange (Classic)", hex: "#ff9900" },
];

interface PhoneEntry {
  phone: string;
  carrier: string;
}

export default function Home() {
  const [phones, setPhones] = useState<PhoneEntry[]>([
    { phone: "", carrier: CARRIERS[0].gateway },
  ]);
  const [pingsPerHour, setPingsPerHour] = useState(2);
  const [totalHours, setTotalHours] = useState(5);
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
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const addPhone = () => {
    setPhones((prev) => [...prev, { phone: "", carrier: CARRIERS[0].gateway }]);
  };

  const removePhone = (index: number) => {
    setPhones((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePhone = (index: number, field: keyof PhoneEntry, value: string) => {
    setPhones((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const totalShots = Math.round(pingsPerHour * totalHours);

  const handleStart = async () => {
    const validPhones = phones.filter((p) => p.phone.replace(/\D/g, "").length >= 10);
    if (validPhones.length === 0) {
      alert("PLEASE ENTER AT LEAST ONE VALID PHONE NUMBER!");
      return;
    }

    setIsFilling(true);

    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phones: validPhones.map((p) => ({
            phone: p.phone.replace(/\D/g, ""),
            carrier: p.carrier,
          })),
          pingsPerHour,
          totalHours,
        }),
      });

      if (!res.ok) throw new Error("Failed to start server process.");

      setTimeout(() => {
        setIsStarted(true);
        logMsg(`SYSTEM INITIALIZED.`);
        logMsg(`TARGETS: ${validPhones.length} number(s) enrolled`);
        logMsg(`RATE: ${pingsPerHour} ping(s)/hr | DURATION: ${totalHours} hrs`);
        logMsg(`TOTAL SHOTS SCHEDULED: ${totalShots}`);
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
        <h1
          className="text-accent text-[24px] mb-2"
          style={{ textShadow: "2px 2px 0px #000, 4px 4px 0px var(--text-main)" }}
        >
          Shot O&apos;Clock
        </h1>
        <p className="text-textMuted text-[10px] tracking-[2px]">Marathon Configurator</p>
      </header>

      <main>
        {/* Pixel Cup */}
        <div className="flex justify-center mb-10">
          <div className="pixel-cup w-[100px] h-[120px] shadow-pixel-cup">
            <div className={`cup-liquid ${isFilling || isStarted ? "fill" : ""}`}></div>
            <div className="cup-highlight"></div>
          </div>
        </div>

        {/* Setup Panel */}
        {!isStarted && (
          <div className="bg-panelBg p-5 border-4 border-textMuted rounded-lg shadow-pixel-panel">

            {/* ── SCHEDULE CONFIG ── */}
            <div className="mb-5 border-b-2 border-dashed border-textMuted pb-5">
              <p className="text-accent text-[9px] mb-4 text-left tracking-widest">[ SCHEDULE ]</p>

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-[9px] text-textMuted text-left mb-2">
                    Pings / Hour:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={pingsPerHour}
                    onChange={(e) => setPingsPerHour(Math.max(1, Math.min(6, Number(e.target.value))))}
                    className="w-full bg-black text-textMain border-2 border-textMuted p-2.5 text-[12px] outline-none focus:border-accent"
                    disabled={isFilling}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] text-textMuted text-left mb-2">
                    Total Hours:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={totalHours}
                    onChange={(e) => setTotalHours(Math.max(1, Math.min(12, Number(e.target.value))))}
                    className="w-full bg-black text-textMain border-2 border-textMuted p-2.5 text-[12px] outline-none focus:border-accent"
                    disabled={isFilling}
                  />
                </div>
              </div>
              <p className="text-textMuted text-[9px] text-right">
                ≈ {totalShots} total shots · every ~{Math.round(60 / pingsPerHour)} min
              </p>
            </div>

            {/* ── PHONE NUMBERS ── */}
            <div className="mb-5 border-b-2 border-dashed border-textMuted pb-5">
              <p className="text-accent text-[9px] mb-4 text-left tracking-widest">[ TARGETS ]</p>

              {phones.map((entry, index) => (
                <div key={index} className="mb-4 relative">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-textMuted text-[9px] whitespace-nowrap">#{index + 1}</span>
                    <input
                      type="tel"
                      value={entry.phone}
                      onChange={(e) => updatePhone(index, "phone", e.target.value)}
                      placeholder="5551234567"
                      className="flex-1 bg-black text-textMain border-2 border-textMuted p-2.5 text-[11px] outline-none focus:border-accent"
                      disabled={isFilling}
                    />
                    {phones.length > 1 && (
                      <button
                        onClick={() => removePhone(index)}
                        className="text-accent text-[14px] border-2 border-accent px-2 py-2 leading-none hover:bg-accent hover:text-black"
                        disabled={isFilling}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <select
                    value={entry.carrier}
                    onChange={(e) => updatePhone(index, "carrier", e.target.value)}
                    className="w-full bg-black text-textMain border-2 border-textMuted p-2.5 text-[11px] outline-none focus:border-accent"
                    disabled={isFilling}
                  >
                    {CARRIERS.map((c) => (
                      <option key={c.gateway} value={c.gateway}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <button
                onClick={addPhone}
                disabled={isFilling || phones.length >= 10}
                className="w-full border-2 border-dashed border-textMuted text-textMuted p-2 text-[9px] hover:border-accent hover:text-accent"
              >
                + ADD ANOTHER NUMBER
              </button>
            </div>

            {/* ── DRINK COLOR ── */}
            <div className="mb-6">
              <p className="text-accent text-[9px] mb-4 text-left tracking-widest">[ DRINK ]</p>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-black text-textMain border-2 border-textMuted p-2.5 text-[11px] outline-none focus:border-accent"
                disabled={isFilling}
              >
                {COLORS.map((c) => (
                  <option key={c.hex} value={c.hex}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

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

        {/* Status Panel */}
        {isStarted && (
          <div className="bg-panelBg p-5 border-4 border-textMuted rounded-lg shadow-pixel-panel">
            <h2 className="text-accent text-[16px] status-blink mb-5">STATUS: DRINKING</h2>
            <div
              ref={logContainerRef}
              className="bg-black border-2 border-textMuted p-2.5 h-[180px] overflow-y-auto text-[8px] text-left leading-relaxed flex flex-col gap-2"
            >
              {logs.map((log, i) => (
                <p
                  key={i}
                  className="text-[var(--liquid-color)] border-b border-dashed border-[#333] pb-1"
                >
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
