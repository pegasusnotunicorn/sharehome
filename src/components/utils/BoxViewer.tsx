import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { BoxArt } from "./box3d";
import type { BoxVideo, BoxViewerApi } from "./boxViewer3d";
import styles from "../../css/utils/boxViewer.module.css";

// The game box in 3D (boxViewer3d.ts): turn it, open it to play the trailer inside. It fills its
// parent. Until the 3D box is in, `still` shows it at rest (a render of the same view); if the browser
// can't show 3D, `fallback` is shown instead.
interface BoxViewerProps {
  art: BoxArt;
  video: BoxVideo;
  label: string;
  still?: string;
  fallback?: ReactNode;
  // something behind the box, placed in the frame of the box at rest (like the still), shown only
  // while the box sits there, shut; it ducks behind the box whenever it's turned or opened
  behind?: ReactNode;
  onOpen?: (open: boolean) => void;
}

const BoxViewer = ({ art, video, label, still, fallback, behind, onOpen }: BoxViewerProps) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const api = useRef<BoxViewerApi | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);
  const [open, setOpen] = useState(false);
  const [atRest, setAtRest] = useState(false);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let gone = false;
    import("./boxViewer3d")
      .then(({ mountBoxViewer }) =>
        mountBoxViewer(stage, {
          art,
          video,
          onMoved: (m) => !gone && setMoved(m),
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
        <span className={styles.behind} data-shown={(ready && atRest) || undefined} aria-hidden="true">
          {behind}
        </span>
      )}
      {still && <img className={styles.still} src={still} alt="" aria-hidden="true" />}
      <span className={`${styles.tools} ${ready ? styles.toolsShown : ""}`.trim()}>
        <button className={styles.pill} type="button" aria-pressed={open} onClick={() => api.current?.open(!open)}>
          {open ? (
            "Close box"
          ) : (
            <>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 3.5v9l7.5-4.5z" fill="currentColor" />
              </svg>
              Open box
            </>
          )}
        </button>
        <button
          className={`${styles.pill} ${styles.reset} ${moved && !open ? styles.resetShown : ""}`.trim()}
          type="button"
          tabIndex={moved && !open ? 0 : -1}
          aria-hidden={!moved || open}
          onClick={() => api.current?.reset()}
        >
          Reset
        </button>
      </span>
    </div>
  );
};

export default BoxViewer;
