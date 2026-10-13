import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import type { DeckApi, DeckCard, DeckPose } from "../../utils/deckCards3d";
import type { CardEdge } from "../../utils/cardViewer3d";
import styles from "../../../css/pages/home/deck3d.module.css";

// A "How to play" step's cards, dealt in 3D as the step scrolls into view (deckCards3d.ts). The 3D
// code loads when the step is getting close. If the browser can't show it (no WebGL), `fallback`
// (the flat cards) is shown instead.
interface Deck3DProps {
  className: string; // the step's deck area
  cards: DeckCard[];
  mm: [number, number];
  edge?: CardEdge;
  from: "left" | "right";
  layout: (w: number, h: number) => DeckPose[];
  fallback: ReactNode;
}

const Deck3D = ({ className, cards, mm, edge, from, layout, fallback }: Deck3DProps) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let api: DeckApi | null = null, gone = false;
    const fail = () => !gone && setFailed(true);
    const start = () =>
      import("../../utils/deckCards3d")
        .then(({ mountDeck }) =>
          mountDeck(stage, {
            cards,
            mm,
            edge,
            from,
            layout,
            onPick: (c) => c.href && navigate(c.href),
            onFail: fail,
          })
        )
        .then((a) => (gone ? a?.destroy() : (api = a)))
        .catch(fail);
    const io = new IntersectionObserver(
      (e) => {
        if (!e.some((x) => x.isIntersecting)) return;
        io.disconnect();
        start();
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(stage);
    return () => {
      gone = true;
      io.disconnect();
      api?.destroy();
    };
    // the cards are picked once per visit; the layout reads the stage's size itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return <>{fallback}</>;

  const links = cards.filter((c) => c.href);
  return (
    <div ref={stageRef} className={`${className} ${styles.stage}`}>
      {links.length > 0 && (
        <ul className={styles.links}>
          {links.map((c) => (
            <li key={c.href}>
              <a href={c.href}>{c.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Deck3D;
