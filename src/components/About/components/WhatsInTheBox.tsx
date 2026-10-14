import { useEffect, useMemo, useRef, useState } from "react";
import type { Piece, PiecesViewerApi } from "../../utils/piecesViewer3d";
import styles from "../../../css/pages/whatsInTheBox.module.css";

// "What's in the box" on the How to play page: every piece in the game in 3D (piecesViewer3d.ts), the
// one picked on top, the decks and their cards below. The list (public/images/pieces/pieces.json,
// scripts/import-pieces.py) is fetched when the tab first opens; three.js and a piece's art load when
// it's shown, and a deck's thumbnails when it's picked.

interface ItemRow {
  name: string;
  front: string;
  back: string;
  text?: string;
  kind?: Piece["kind"];
  mm?: number[];
  sides?: Piece["sides"];
}
interface DeckRow {
  name: string;
  kind?: Piece["kind"];
  mm?: number[];
  cols: number;
  thumbs: string;
  items: ItemRow[];
}
interface Item extends Piece {
  name: string;
  deck: number;
  i: number; // its place in its deck (and its thumbnail's cell)
  hay: string; // what search looks through: its name, and what's printed on a character card's back
}
interface Deck {
  name: string;
  cols: number;
  thumbs: string;
  items: Item[];
}

let listP: Promise<Deck[]> | null = null;
const loadList = () =>
  (listP ||= fetch("/images/pieces/pieces.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<{ decks: DeckRow[] }>;
    })
    .then(({ decks }) =>
      decks.map((d, di) => ({
        name: d.name,
        cols: d.cols,
        thumbs: d.thumbs,
        items: d.items.map((c, i) => ({
          key: `${di}/${i}`,
          kind: c.kind || d.kind || "card",
          mm: c.mm || d.mm || [1, 1],
          front: c.front,
          back: c.back,
          sides: c.sides,
          name: c.name,
          deck: di,
          i,
          hay: `${c.name} ${c.text || ""}`.toLowerCase(),
        })),
      }))
    )
    .catch((e) => {
      listP = null;
      throw e;
    }));

// one cell of the deck's thumbnail sheet as a background
const cell = (d: Deck, i: number) => {
  const cols = d.cols, rows = Math.max(1, Math.ceil(d.items.length / cols)), c = i % cols, r = Math.floor(i / cols);
  return {
    backgroundImage: `url("${d.thumbs}")`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${cols > 1 ? (c / (cols - 1)) * 100 : 0}% ${rows > 1 ? (r / (rows - 1)) * 100 : 0}%`,
  };
};

const ZoomIn = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 3.5v9M3.5 8h9" />
  </svg>
);
const ZoomOut = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 8h9" />
  </svg>
);
const Reset = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
    <path d="M2.5 2.5v3h3" />
  </svg>
);
const Arrow = ({ back }: { back?: boolean }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d={back ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
  </svg>
);

const WhatsInTheBox = () => {
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [listFailed, setListFailed] = useState(false);
  const [deck, setDeck] = useState(0);
  const [query, setQuery] = useState("");
  const [at, setAt] = useState<Item | null>(null);
  const [failed, setFailed] = useState(""); // the piece whose art didn't load
  const [noGl, setNoGl] = useState(false);
  const [sheets, setSheets] = useState<Record<string, boolean>>({}); // the thumbnail sheets that have arrived
  const stageRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<PiecesViewerApi | null>(null);
  const atRef = useRef<Item | null>(null);
  atRef.current = at;

  const fetchList = () => {
    setListFailed(false);
    loadList()
      .then((d) => {
        setDecks(d);
        setAt((a) => a ?? d[0].items[0]);
      })
      .catch(() => setListFailed(true));
  };
  useEffect(fetchList, []);

  // the viewer, once there's a stage
  useEffect(() => {
    const stage = stageRef.current;
    if (!decks || !stage) return;
    let gone = false;
    import("../../utils/piecesViewer3d")
      .then(({ mountPiecesViewer }) => mountPiecesViewer(stage, { onFail: (key) => !gone && setFailed(key) }))
      .then((v) => {
        if (gone) return v?.destroy();
        viewer.current = v;
        if (v && atRef.current) v.show(atRef.current);
      })
      .catch(() => !gone && setNoGl(true));
    return () => {
      gone = true;
      viewer.current?.destroy();
      viewer.current = null;
    };
  }, [decks]);

  // what the grid shows: the deck, or every match across the decks
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const groups = useMemo(() => {
    if (!decks) return [];
    if (!words.length) return [{ deck: decks[deck], items: decks[deck].items }];
    return decks.map((d) => ({ deck: d, items: d.items.filter((c) => words.every((w) => c.hay.includes(w))) })).filter((g) => g.items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decks, deck, words.join(" ")]);
  const list = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // the thumbnail sheets of the decks on show (and the picked piece's), once each has arrived (a
  // blank cell until then)
  useEffect(() => {
    if (!decks) return;
    const want = new Set(groups.map((g) => g.deck.thumbs));
    if (at) want.add(decks[at.deck].thumbs);
    for (const src of want) {
      if (sheets[src] !== undefined) continue;
      setSheets((s) => ({ ...s, [src]: false }));
      const im = new Image();
      im.onload = () => setSheets((s) => ({ ...s, [src]: true }));
      im.src = src;
    }
  }, [decks, groups, at, sheets]);

  // the picked piece, in 3D
  useEffect(() => {
    if (!at) return;
    setFailed("");
    viewer.current?.show(at);
  }, [at]);
  const pick = (c: Item) => {
    setAt(c);
    const st = stageRef.current;
    if (st && st.getBoundingClientRect().top < 0) st.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const go = (dir: number) => {
    if (!at) return;
    const k = list.findIndex((c) => c.key === at.key);
    const pool = k >= 0 ? list : decks![at.deck].items, j = k >= 0 ? k : at.i;
    setAt(pool[(j + dir + pool.length) % pool.length]);
  };

  if (listFailed)
    return (
      <div className={styles.message}>
        <b>Couldn’t load the pieces.</b>
        <button type="button" className={styles.retry} onClick={fetchList}>
          Try again
        </button>
      </div>
    );
  if (!decks || !at) return <div className={styles.loading} aria-busy="true" />;

  const d = decks[at.deck];
  const pos = list.findIndex((c) => c.key === at.key);
  const count = pos >= 0 ? `${pos + 1} / ${list.length}` : `${at.i + 1} / ${d.items.length}`;

  return (
    <div className={styles.box}>
      <div className={styles.viewer}>
        <div
          ref={stageRef}
          className={styles.stage} // piecesViewer3d.ts adds its own classes (ready, used...), so React leaves this alone
          tabIndex={0}
          role="img"
          aria-label={`${at.name} in 3D. Drag, or use the arrow keys, to turn it any way; plus and minus zoom.`}
        >
          <i className={styles.still} style={sheets[d.thumbs] ? cell(d, at.i) : undefined} />
          <span className={styles.tools}>
            <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => viewer.current?.zoom(1.4)}>
              <ZoomIn />
            </button>
            <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => viewer.current?.zoom(0.714)}>
              <ZoomOut />
            </button>
            <button type="button" className={styles.reset} title="Straighten it" aria-label="Straighten it" onClick={() => viewer.current?.reset()}>
              <Reset />
            </button>
          </span>
          {(failed === at.key || noGl) && (
            <p className={styles.error} role="alert">
              {noGl ? "Your browser can’t show this in 3D." : "Couldn’t load this piece. Try again in a moment."}
            </p>
          )}
        </div>
        <div className={styles.caption}>
          <button type="button" className={styles.step} onClick={() => go(-1)} aria-label="Previous piece" title="Previous">
            <Arrow back />
          </button>
          <div className={styles.what} aria-live="polite">
            <h3>{at.name}</h3>
            <span>
              {d.name} · {count}
            </span>
          </div>
          <button type="button" className={styles.step} onClick={() => go(1)} aria-label="Next piece" title="Next">
            <Arrow />
          </button>
        </div>
      </div>

      <div className={styles.bar}>
        <div className={styles.decks} role="group" aria-label="Decks">
          {decks.map((x, i) => {
            const n = words.length ? groups.find((g) => g.deck === x)?.items.length ?? 0 : x.items.length;
            return (
              <button
                key={x.name}
                type="button"
                className={`${styles.deck} ${words.length && !n ? styles.dim : ""}`}
                aria-pressed={!words.length && i === deck}
                title={words.length ? `${n} in ${x.name}: show the whole deck` : x.name}
                onClick={() => {
                  setQuery("");
                  setDeck(i);
                }}
              >
                {x.name}
                <span className={styles.n}>{n}</span>
              </button>
            );
          })}
        </div>
        <input
          type="search"
          className={styles.search}
          placeholder="Search"
          aria-label="Search every deck: card names and what's printed on the character cards"
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {groups.length ? (
        groups.map((g) => (
          <section key={g.deck.name} aria-label={g.deck.name}>
            {words.length > 0 && (
              <h4 className={styles.groupTitle}>
                {g.deck.name}
                <span className={styles.n}>{g.items.length}</span>
              </h4>
            )}
            <div className={`${styles.grid} ${g.deck.cols < 10 ? styles.gridWide : ""}`}>
              {g.items.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={styles.card}
                  aria-current={c.key === at.key || undefined}
                  aria-label={`Show ${c.name} in 3D`}
                  onClick={() => pick(c)}
                >
                  <span className={styles.thumbBox}>
                    <i className={styles.thumb} style={sheets[g.deck.thumbs] ? cell(g.deck, c.i) : undefined} />
                  </span>
                  <b>{c.name}</b>
                </button>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className={styles.message}>
          <b>Nothing matches “{query.trim()}”</b>
          <button type="button" className={styles.retry} onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsInTheBox;
