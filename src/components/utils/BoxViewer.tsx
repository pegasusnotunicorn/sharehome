import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { BoxArt } from "./box3d";
import type { BoxVideo, BoxViewerApi } from "./boxViewer3d";
import { savingData } from "./later";
import styles from "../../css/utils/boxViewer.module.css";

// The game box in 3D (boxViewer3d.ts): turn it, click it to open it and play the trailer inside
// (a click off it closes it). It fills its parent. Until the 3D box is in, `still` shows it at rest
// (a render of the same view). If the browser can't show 3D, or the visitor is saving data (Data
// Saver, or a 2G connection), `fallback` is shown instead, and none of the 3D (three.js, the box's
// art, the trailer's player) is downloaded.
interface BoxViewerProps {
  art: BoxArt;
  video: BoxVideo;
  label: string;
  still?: string;
  fallback?: ReactNode;
  // something behind the box, placed in the frame of the box at rest (like the still), shown only
  // while the box sits there, shut; it ducks behind the box whenever it's turned or opened
  behind?: ReactNode;
  onPeek?: (shown: boolean) => void; // when what's behind pops up, or ducks
  onOpen?: (open: boolean) => void;
  onStill?: () => void; // the still (or the fallback) is on screen
  onSettled?: () => void; // the 3D box is in, or won't be: the page can load what it held back
}

const BoxViewer = ({ art, video, label, still, fallback, behind, onPeek, onOpen, onStill, onSettled }: BoxViewerProps) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const api = useRef<BoxViewerApi | null>(null);
  const [failed, setFailed] = useState(() => savingData());
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [atRest, setAtRest] = useState(false);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const onPeekRef = useRef(onPeek);
  onPeekRef.current = onPeek;
  const peeking = ready && atRest;
  // no 3D, or none yet after a couple of seconds (a slow connection): the words don't wait for it
  const [late, setLate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLate(true), 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    onPeekRef.current?.(peeking || failed || (late && !ready));
  }, [peeking, failed, late, ready]);
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;
  useEffect(() => {
    if (ready || failed) onSettledRef.current?.();
  }, [ready, failed]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || failed) return;
    let gone = false;
    // (the box's code and three.js come down together, not one after the other)
    Promise.all([import("./boxViewer3d"), import("./card3d").then((m) => m.loadThree())])
      .then(([{ mountBoxViewer }]) =>
        mountBoxViewer(stage, {
          art,
          video,
          onRest: (r) => !gone && setAtRest(r),
          onOpen: (o) => {
            if (gone) return;
            setOpen(o);
            onOpenRef.current?.(o);
          },
          onFail: () => !gone && setFailed(true),
        })
      )
      .then((a) => {
        if (gone) a?.destroy();
        else {
          api.current = a;
          setReady(!!a);
        }
      })
      .catch(() => !gone && setFailed(true));
    return () => {
      gone = true;
      api.current?.destroy();
      api.current = null;
    };
    // one box per viewer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed && fallback) return <>{fallback}</>;

  return (
    <div
      ref={stageRef}
      className={styles.stage} // boxViewer3d.ts adds its own classes (ready, drag...), so React leaves this alone
      data-open={open || undefined}
      tabIndex={0}
      role="group"
      aria-roledescription="3D box"
      aria-label={`${label}. Drag, or use the arrow keys, to turn it. Click it, or press Enter, to open it and watch the trailer.`}
    >
      {behind && (
        <span className={styles.behind} data-shown={peeking || undefined} aria-hidden="true">
          {behind}
        </span>
      )}
      {still && <img className={styles.still} src={still} alt="" aria-hidden="true" onLoad={onStill} />}
    </div>
  );
};

export default BoxViewer;
