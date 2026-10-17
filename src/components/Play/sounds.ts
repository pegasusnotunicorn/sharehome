// The game's sound effects, made on the spot with Web Audio (no files to load): short, soft and
// cheerful, like cards and chips on a table, a studio audience, a TV remote. Muting is kept in this
// browser (the waiting room and the table share it).

type Sound =
  | "whoosh"
  | "deal"
  | "complete"
  | "undo"
  | "token"
  | "trait"
  | "start"
  | "tick"
  | "timeUp"
  | "wrap"
  | "finale"
  | "page"
  // the waiting room
  | "join" // someone took a seat
  | "leave" // someone left
  | "pick" // a character picked
  | "ready" // ready, ticked
  | "unready"
  | "copy" // the link or the code copied
  | "showtime" // the host's started the show: a fanfare
  | "curtain" // the curtains sweeping open
  // anywhere
  | "chat" // a line from someone else
  | "send" // your own line
  | "remote" // a button on the R.E.M.O.T.E.
  | "swap" // a card back into its deck
  | "turn" // the picker's cards swinging round
  | "applause"
  | "countdown" // the clock's last three seconds
  | "doorsClose" // the host shuts the doors to more spectators: a heavy door, and a latch
  | "doorsOpen" // and opens them: a creak, and a bright chime
  | "pickUp" // the phone picked up off the table: a lift, and its screen waking
  | "putDown"; // and set back down: a soft clack on the table

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

// a pitch that slides: from one note to another over its length
const slide = (a: AudioContext, from: number, to: number, at: number, dur: number, type: OscillatorType = "sine", vol = 0.14) => {
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, a.currentTime + at);
  osc.frequency.exponentialRampToValueAtTime(to, a.currentTime + at + dur);
  gain.gain.setValueAtTime(0.0001, a.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(vol, a.currentTime + at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + at + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(a.currentTime + at);
  osc.stop(a.currentTime + at + dur + 0.05);
};

// a studio audience clapping: lots of little bursts of noise, a crowd's worth, swelling then fading
const applause = (a: AudioContext, dur = 2.2, vol = 0.16) => {
  const length = Math.floor(a.sampleRate * dur);
  const buffer = a.createBuffer(1, length, a.sampleRate);
  const data = buffer.getChannelData(0);
  const claps = Math.floor(dur * 55);
  for (let c = 0; c < claps; c++) {
    const start = Math.floor(Math.random() * (length - a.sampleRate * 0.03));
    const clap = Math.floor(a.sampleRate * (0.008 + Math.random() * 0.014));
    const loud = 0.4 + Math.random() * 0.6;
    for (let i = 0; i < clap; i++) data[start + i] += (Math.random() * 2 - 1) * loud * Math.exp(-i / (clap / 3));
  }
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.6;
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(vol, a.currentTime + 0.35);
  gain.gain.setValueAtTime(vol, a.currentTime + dur * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
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
    case "whoosh": {
      // a tablecloth shaken out over the table: a soft rush of air, rising then falling
      const length = Math.floor(a.sampleRate * 0.45);
      const buffer = a.createBuffer(1, length, a.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      const src = a.createBufferSource();
      src.buffer = buffer;
      const filter = a.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 1.4;
      filter.frequency.setValueAtTime(500, a.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2600, a.currentTime + 0.18);
      filter.frequency.exponentialRampToValueAtTime(700, a.currentTime + 0.45);
      const gain = a.createGain();
      gain.gain.setValueAtTime(0.0001, a.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.22, a.currentTime + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.45);
      src.connect(filter).connect(gain).connect(a.destination);
      src.start();
      break;
    }
    case "page":
      // a page turning: two soft brushes of paper
      swish(a, 0, 0.16, 0.07);
      swish(a, 0.1, 0.12, 0.045);
      break;
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
      applause(a, 3, 0.14);
      break;
    case "join":
      // a doorbell: ding-dong, bright
      note(a, 988, 0, 0.35, "sine", 0.13);
      note(a, 784, 0.18, 0.5, "sine", 0.12);
      break;
    case "leave":
      slide(a, 660, 330, 0, 0.3, "sine", 0.1);
      break;
    case "pick":
      // a card flicked onto the table, and a sparkle
      swish(a, 0, 0.09, 0.1);
      note(a, 1319, 0.06, 0.12, "triangle", 0.09);
      note(a, 1760, 0.12, 0.2, "triangle", 0.07);
      break;
    case "ready":
      // a pop and a bright two-note "yes!"
      slide(a, 300, 900, 0, 0.07, "sine", 0.12);
      note(a, 880, 0.06, 0.12, "triangle", 0.13);
      note(a, 1319, 0.14, 0.26, "triangle", 0.12);
      break;
    case "unready":
      slide(a, 700, 380, 0, 0.14, "sine", 0.1);
      break;
    case "copy":
      note(a, 1568, 0, 0.06, "sine", 0.1);
      note(a, 2093, 0.05, 0.1, "sine", 0.09);
      break;
    case "showtime":
      // a TV studio's fanfare: a drum roll, a brass chord, and the audience
      for (let r = 0; r < 14; r++) swish(a, r * 0.045, 0.05, 0.05 + r * 0.004);
      [392, 494, 587].forEach((f) => note(a, f, 0.65, 0.5, "sawtooth", 0.06));
      [523, 659, 784].forEach((f) => note(a, f, 0.95, 0.9, "sawtooth", 0.07));
      note(a, 1047, 0.95, 0.9, "triangle", 0.09);
      setTimeout(() => !isMuted() && applause(a, 2.4, 0.13), 1000);
      break;
    case "curtain": {
      // heavy velvet sweeping open: a long low rush
      const length = Math.floor(a.sampleRate * 1.1);
      const buffer = a.createBuffer(1, length, a.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      const src = a.createBufferSource();
      src.buffer = buffer;
      const filter = a.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, a.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, a.currentTime + 0.5);
      filter.frequency.exponentialRampToValueAtTime(300, a.currentTime + 1.1);
      const gain = a.createGain();
      gain.gain.setValueAtTime(0.0001, a.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, a.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 1.1);
      src.connect(filter).connect(gain).connect(a.destination);
      src.start();
      break;
    }
    case "chat":
      // a soft bubble pop
      slide(a, 500, 1100, 0, 0.09, "sine", 0.1);
      break;
    case "send":
      slide(a, 900, 1500, 0, 0.07, "sine", 0.07);
      break;
    case "remote":
      // the remote's click, and the TV's beep
      note(a, 3000, 0, 0.015, "square", 0.05);
      note(a, 1046, 0.05, 0.16, "square", 0.06);
      break;
    case "swap":
      swish(a, 0, 0.14, 0.09);
      slide(a, 500, 260, 0.02, 0.16, "triangle", 0.06);
      break;
    case "turn":
      // cards riffling round
      for (let r = 0; r < 5; r++) swish(a, r * 0.05, 0.05, 0.05);
      break;
    case "applause":
      applause(a);
      break;
    case "doorsClose":
      slide(a, 220, 110, 0, 0.3, "triangle", 0.12);
      swish(a, 0.02, 0.22, 0.08);
      note(a, 140, 0.28, 0.18, "square", 0.12);
      note(a, 1800, 0.3, 0.04, "square", 0.05);
      break;
    case "doorsOpen":
      slide(a, 180, 420, 0, 0.35, "sawtooth", 0.035);
      note(a, 880, 0.32, 0.25, "sine", 0.1);
      note(a, 1320, 0.42, 0.35, "sine", 0.09);
      break;
    case "countdown":
      note(a, 880, 0, 0.12, "square", 0.08);
      break;
    case "pickUp":
      swish(a, 0, 0.18, 0.06);
      slide(a, 260, 520, 0, 0.16, "sine", 0.06);
      note(a, 1175, 0.14, 0.12, "sine", 0.07);
      note(a, 1568, 0.21, 0.2, "sine", 0.06);
      break;
    case "putDown":
      swish(a, 0, 0.12, 0.05);
      slide(a, 180, 70, 0.08, 0.12, "triangle", 0.16);
      note(a, 2400, 0.08, 0.012, "square", 0.035);
      break;
  }
}
