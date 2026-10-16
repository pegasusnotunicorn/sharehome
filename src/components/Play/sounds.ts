// The table's sound effects, made on the spot with Web Audio (no files to load): short, soft and
// cheerful, like cards and chips on a table. Muting is kept in this browser.

type Sound = "deal" | "complete" | "undo" | "token" | "trait" | "start" | "tick" | "timeUp" | "wrap" | "finale";

let ctx: AudioContext | null = null;
const MUTE_KEY = "lcm-play-muted";

export const isMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
};

export const setMuted = (muted: boolean) => {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // (just for this visit)
  }
};

const audio = () => {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

// browsers only let a page make sound after a tap: the first one wakes the audio up
if (typeof window !== "undefined") {
  const wake = () => {
    audio();
    window.removeEventListener("pointerdown", wake);
    window.removeEventListener("keydown", wake);
  };
  window.addEventListener("pointerdown", wake);
  window.addEventListener("keydown", wake);
}

// one note: a pitch, when it starts, how long it rings, its shape and loudness
const note = (a: AudioContext, freq: number, at: number, dur: number, type: OscillatorType = "triangle", vol = 0.18) => {
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime + at);
  gain.gain.setValueAtTime(0.0001, a.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(vol, a.currentTime + at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + at + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(a.currentTime + at);
  osc.stop(a.currentTime + at + dur + 0.05);
};

// a card's swish: a short burst of filtered noise
const swish = (a: AudioContext, at = 0, dur = 0.12, vol = 0.12) => {
  const length = Math.floor(a.sampleRate * dur);
  const buffer = a.createBuffer(1, length, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2400;
  filter.Q.value = 0.8;
  const gain = a.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(a.currentTime + at);
};

export function play(sound: Sound) {
  if (isMuted()) return;
  const a = audio();
  if (!a || a.state !== "running") return;
  switch (sound) {
    case "deal":
      swish(a, 0, 0.1, 0.1);
      break;
    case "complete":
      swish(a, 0, 0.1, 0.08);
      note(a, 784, 0.03, 0.18);
      note(a, 1175, 0.11, 0.3);
      break;
    case "undo":
      note(a, 523, 0, 0.12, "sine", 0.14);
      note(a, 392, 0.08, 0.2, "sine", 0.12);
      break;
    case "token":
      note(a, 1568, 0, 0.08, "square", 0.05);
      note(a, 2093, 0.05, 0.12, "triangle", 0.08);
      break;
    case "trait":
      note(a, 659, 0, 0.12);
      note(a, 880, 0.07, 0.12);
      note(a, 1319, 0.14, 0.25);
      break;
    case "start":
      note(a, 523, 0, 0.15);
      note(a, 659, 0.12, 0.15);
      note(a, 784, 0.24, 0.35);
      break;
    case "tick":
      note(a, 1200, 0, 0.05, "square", 0.04);
      break;
    case "timeUp":
      // an alarm clock going off: three bursts of fast rings, then a low buzz
      for (let burst = 0; burst < 3; burst++)
        for (let r = 0; r < 6; r++) note(a, r % 2 ? 1568 : 1760, burst * 0.42 + r * 0.055, 0.05, "square", 0.16);
      note(a, 220, 1.3, 0.55, "sawtooth", 0.22);
      note(a, 165, 1.3, 0.55, "sawtooth", 0.18);
      break;
    case "wrap":
      note(a, 784, 0, 0.12);
      note(a, 988, 0.1, 0.12);
      note(a, 1175, 0.2, 0.3);
      break;
    case "finale":
      [523, 659, 784, 1047].forEach((f, i) => note(a, f, i * 0.13, 0.3));
      note(a, 1319, 0.55, 0.7);
      break;
  }
}
