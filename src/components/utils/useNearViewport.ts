import { useEffect, useState } from "react";
import type { RefObject } from "react";

// Whether an element has come near the screen (within `rootMargin` of it, `threshold` of it showing):
// for things that load only as they're about to be seen. Once it has, it stays true.
export default function useNearViewport(ref: RefObject<Element | null>, { rootMargin = "600px", threshold = 0 } = {}) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (near || !el) return;
    if (typeof IntersectionObserver === "undefined") return setNear(true);
    const io = new IntersectionObserver(
      (entries) => {
        // (the first report can be of less than `threshold`)
        if (!entries.some((e) => e.isIntersecting && e.intersectionRatio >= threshold)) return;
        io.disconnect();
        setNear(true);
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, near, rootMargin, threshold]);
  return near;
}
