import { useEffect, useRef, type RefObject } from "react";

// the dialogs open right now, oldest first: only the top one hears Escape and keeps Tab (so one
// Escape closes one layer, the one in front)
const layers: symbol[] = [];

const FOCUSABLE = "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
// (what Tab can reach in it now: nothing disabled, hidden or out of play)
const reachable = (el: HTMLElement) =>
  [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (x) => !(x as HTMLButtonElement).disabled && !x.closest("[inert], [aria-hidden='true']") && x.getClientRects().length > 0
  );

// A dialog's focus, the same for every dialog on the site: as it opens, focus moves into it (to a
// field that focuses itself, or the part of it marked data-autofocus, or else its first control); Tab
// and Shift+Tab go round inside it; Escape closes it; and once it's closed, focus goes back where it
// was. `open` is for a dialog that stays mounted while it's shut; `modal: false` is for a panel beside
// the page (Tab only goes round once focus is in it).
export default function useDialogFocus(
  panel: RefObject<HTMLElement | null>,
  onClose: () => void,
  { open = true, modal = true }: { open?: boolean; modal?: boolean } = {}
) {
  const close = useRef(onClose);
  close.current = onClose;
  // (where focus was: taken as it renders open, before anything in it focuses itself)
  const before = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  if (open && !wasOpen.current) before.current = document.activeElement as HTMLElement | null;
  wasOpen.current = open;

  useEffect(() => {
    if (!open) return;
    const me = Symbol("dialog");
    layers.push(me);
    const el = panel.current;
    if (el && !el.contains(document.activeElement)) {
      // (a part marked data-autofocus: its first control, rather than the dialog's ×)
      const zone = el.querySelector<HTMLElement>("[data-autofocus]");
      const first = el.querySelector<HTMLElement>("[autofocus]") ?? (zone && reachable(zone)[0]) ?? reachable(el)[0] ?? el;
      first.focus({ preventScroll: true });
    }
    const onKey = (e: KeyboardEvent) => {
      if (layers[layers.length - 1] !== me || e.defaultPrevented || !el) return;
      if (e.key === "Escape") {
        e.preventDefault();
        return close.current();
      }
      if (e.key !== "Tab") return;
      const all = reachable(el);
      const inside = el.contains(document.activeElement);
      if (!inside && !modal) return;
      if (!all.length) return e.preventDefault();
      const first = all[0], last = all[all.length - 1];
      const at = document.activeElement;
      if (!inside || (e.shiftKey ? at === first || at === el : at === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      layers.splice(layers.indexOf(me), 1);
      // (back where it was, unless focus has gone somewhere else on purpose meanwhile)
      const now = document.activeElement;
      const lost = !now || now === document.body || !!el?.contains(now) || !now.isConnected;
      if (lost && before.current?.isConnected) before.current.focus({ preventScroll: true });
    };
    // (a dialog's panel is the same element for as long as it's open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modal]);
}
