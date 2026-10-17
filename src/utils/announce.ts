// Something read out by screen readers, politely (after whatever they're saying), and not shown: one
// hidden live region for the whole page, made the first time it's needed
let region: HTMLElement | null = null;
let clear: ReturnType<typeof setTimeout> | undefined;

export default function announce(text: string) {
  if (typeof document === "undefined" || !text) return;
  if (!region?.isConnected) {
    region = document.createElement("div");
    region.className = "visually-hidden";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("role", "status");
    document.body.appendChild(region);
  }
  // (a line at a time, kept a moment so a burst is read out together; the same line again still reads)
  const r = region;
  r.textContent = r.textContent && r.textContent !== text ? `${r.textContent} ${text}` : text;
  clearTimeout(clear);
  clear = setTimeout(() => (r.textContent = ""), 3000);
}
