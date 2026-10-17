// A name's first letter, for an avatar: a whole character (an emoji, an accented letter, a family of
// emoji), never half of one, in capitals
type Segmenter = new () => { segment: (s: string) => Iterable<{ segment: string }> };
const Seg = (Intl as unknown as { Segmenter?: Segmenter }).Segmenter;
const seg = Seg ? new Seg() : null;

export default function initial(name: string) {
  const n = name.trim();
  const first = seg ? (seg.segment(n)[Symbol.iterator]().next().value?.segment ?? "") : (Array.from(n)[0] ?? "");
  return first.toUpperCase();
}
