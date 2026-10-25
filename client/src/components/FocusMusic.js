import { useState, useRef, useEffect } from "react";
import "../styles/FocusMusic.css";

const SOUNDS = [
  { id: "rain",   label: "🌧️ Rain",      color: "#3b82f6" },
  { id: "cafe",   label: "☕ Café",      color: "#b45309" },
  { id: "ocean",  label: "🌊 Ocean",     color: "#0891b2" },
  { id: "forest", label: "🌲 Forest",    color: "#16a34a" },
  { id: "white",  label: "🎯 Focus",     color: "#7c3aed" },
];

// Generate different noise types using Web Audio API
const generateNoise = (ctx, type) => {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === "white" || type === "cafe") {
        data[i] = white * 0.3;
      } else if (type === "rain" || type === "ocean" || type === "forest") {
        // Brown noise (warm, deep — like rain/ocean)
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 4.0;
      }
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
};

const FocusMusic = () => {
  const [playing, setPlaying]   = useState(false);
  const [current, setCurrent]   = useState("rain");
  const [volume, setVolume]     = useState(0.5);
  const ctxRef    = useRef(null);
  const sourceRef = useRef(null);
  const gainRef   = useRef(null);

  const stop = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (_) {}
      sourceRef.current = null;
    }
  };

  const play = (soundId, vol) => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    stop();

    const gain = ctx.createGain();
    gain.gain.value = vol ?? volume;
    gainRef.current = gain;

    const source = generateNoise(ctx, soundId);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    sourceRef.current = source;
  };

  const toggle = () => {
    if (playing) { stop(); setPlaying(false); }
    else         { play(current, volume); setPlaying(true); }
  };

  const switchSound = (id) => {
    setCurrent(id);
    if (playing) play(id, volume);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  // Stop on unmount
  useEffect(() => () => stop(), []);

  const activeSnd = SOUNDS.find((s) => s.id === current);

  return (
    <div className="focus-music">
      <div className="fm-header">
        <span>🎵 Focus Sounds</span>
        <button
          className={`fm-play ${playing ? "active" : ""}`}
          onClick={toggle}
          style={playing ? { background: activeSnd.color } : {}}
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      <div className="fm-sounds">
        {SOUNDS.map((s) => (
          <button
            key={s.id}
            className={`fm-btn ${current === s.id ? "selected" : ""}`}
            style={current === s.id ? { borderColor: s.color, color: s.color } : {}}
            onClick={() => switchSound(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="fm-volume">
        <span>🔈</span>
        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolume} />
        <span>🔊</span>
      </div>
    </div>
  );
};

export default FocusMusic;
