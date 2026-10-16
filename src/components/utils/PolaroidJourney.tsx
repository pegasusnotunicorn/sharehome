import { useEffect, useRef, useState } from "react";
import PolaroidGallery, { PolaroidLightbox, formatDate } from "./PolaroidGallery";
import { CONTACT_POLAROIDS } from "./contactPolaroids";
import type { PolaroidRingApi } from "./polaroidRing3d";
import styles from "../../css/utils/polaroidJourney.module.css";

// The polaroids from the journey so far, going round in 3D (polaroidRing3d.ts) under a title, the
// caption of the one in front below it: on the contact and thank-you pages. It goes round by itself
// while it's on screen and left alone; Prev / Next, a swipe, or a click on a photo turns it, and a click on
// the one in front opens it large. Where 3D can't be drawn, the polaroids lie flat instead.

const AUTO_MS = 3600;
const AFTER_TOUCH_MS = 8000; // after someone's turned it themselves, it waits longer before going on
const PHOTOS = CONTACT_POLAROIDS.map((p) => ({ src: p.src, date: formatDate(p.date) }));

interface PolaroidJourneyProps {
  label: string;
  title: string;
  start?: number; // the photo in front to begin with
}

const PolaroidJourney = ({ label, title, start = 0 }: PolaroidJourneyProps) => {
  const stage = useRef<HTMLDivElement>(null);
  const api = useRef<PolaroidRingApi | null>(null);
  const [at, setAt] = useState(start);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [held, setHeld] = useState(false); // a pointer or focus on it: it waits
  const [shown, setShown] = useState(false); // on screen
  const touched = useRef(0); // when someone last turned it themselves
  const [tick, setTick] = useState(0); // (to wait again, with the photo in front the same)
  const nudge = (n: number) => {
    touched.current = Date.now();
    api.current?.turn(n);
  };

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let gone = false;
    import("./polaroidRing3d")
      .then(({ mountPolaroidRing }) =>
        mountPolaroidRing(el, {
          photos: PHOTOS,
          start,
          onTurn: (i) => !gone && setAt(i),
          onOpen: (i) => !gone && setOpen(i),
          onTouch: () => (touched.current = Date.now()),
          onFail: () => !gone && setFailed(true),
        })
      )
      .then((a) => {
        if (gone) return a?.destroy();
        api.current = a;
        if (a) setLive(true);
      })
      .catch(() => !gone && setFailed(true));
    return () => {
      gone = true;
      api.current?.destroy();
      api.current = null;
    };
    // (the photo it starts on is only read the first time)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShown(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  // round it goes, while it's on screen and nobody's looking closely (and not for visitors who ask for
  // less motion)
  useEffect(() => {
    if (!live || held || !shown || open !== null) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // (each turn starts the wait again)
    const wait = Math.max(AUTO_MS, touched.current + AFTER_TOUCH_MS - Date.now());
    const t = setTimeout(() => {
      // (the tab's out of sight, or it's been turned by hand meanwhile: wait again)
      if (document.hidden || Date.now() < touched.current + AFTER_TOUCH_MS) setTick((n) => n + 1);
      else api.current?.turn(1);
    }, wait);
    return () => clearTimeout(t);
  }, [live, held, shown, open, at, tick]);

  const item = CONTACT_POLAROIDS[at];
  const shownItem = open !== null ? CONTACT_POLAROIDS[open] : null;

  return (
    <section className={styles.journey} aria-roledescription="carousel" aria-label={title}>
      <header className={styles.journeyHead}>
        <p className={styles.label}>{label}</p>
        <h2 className={styles.journeyTitle}>{title}</h2>
      </header>

      {failed ? (
        <PolaroidGallery items={CONTACT_POLAROIDS} className={styles.flatPolaroids} showConnector={false} />
      ) : (
        <div onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
          <div ref={stage} className={styles.ring}>
            {!live && <img className={styles.ringStill} src={CONTACT_POLAROIDS[start].src} alt="" />}
          </div>
          <div className={styles.journeyBar} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
            <button type="button" className={styles.chip} onClick={() => nudge(-1)} aria-label="Previous photo">
              <Chevron flip />
            </button>
            <div className={styles.caption} aria-live={held ? "polite" : "off"}>
              <p key={at} className={styles.captionText}>
                {item.caption}
              </p>
            </div>
            <button type="button" className={styles.chip} onClick={() => nudge(1)} aria-label="Next photo">
              <Chevron />
            </button>
          </div>
        </div>
      )}

      {shownItem && <PolaroidLightbox item={shownItem} onClose={() => setOpen(null)} />}
    </section>
  );
};

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export default PolaroidJourney;
