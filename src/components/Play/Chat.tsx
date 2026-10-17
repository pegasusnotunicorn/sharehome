import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CHAT_EMOJI, CHAT_MAX, type ChatLine, type ClientMessage } from "../../../game-server/src/protocol";
import Icon from "../utils/Icons";
import useDialogFocus from "../utils/useDialogFocus";
import { useOffline } from "./useRoom";
import Confirm from "./Confirm";
import { play } from "./sounds";
import { PLAYER_COLORS } from "./GameTable";
import styles from "../../css/pages/chat.module.css";

// The room's chat, for players and spectators alike. In the waiting room: a button in the corner (a
// count on it of lines not yet seen), and a panel with the lines and a box to write one. At the
// table, its pieces go on the phone, in with what's happened. The cast's own emoji go in with
// the face button, written as :name: and shown as their pictures.

const emojiSrc = (name: string) => `/images/emojis/${name}.webp`;
const KNOWN = new Set<string>(CHAT_EMOJI);
// each emoji's name, as its tooltip: the way it's written in a line (:bizzHappy:)
const emojiName = (name: string) => `:${name}:`;

// a line's text, its :emoji: as pictures (a line of nothing but emoji, bigger)
export const ChatText = ({ text }: { text: string }) => {
  const parts = text.split(/(:[A-Za-z]+:)/g).filter(Boolean);
  const onlyEmoji = parts.every((p) => /^:[A-Za-z]+:$/.test(p) ? KNOWN.has(p.slice(1, -1)) : !p.trim());
  return (
    <span className={onlyEmoji ? styles.bigEmoji : undefined}>
      {parts.map((p, i) => {
        const m = p.match(/^:([A-Za-z]+):$/);
        return m && KNOWN.has(m[1]) ? <span key={i} className={styles.emojiWrap} data-tip={emojiName(m[1])}>
              <img className={styles.emoji} src={emojiSrc(m[1])} alt={emojiName(m[1])} draggable={false} />
            </span> : <span key={i}>{p}</span>;
      })}
    </span>
  );
};

// the emoji's names, for whatever's under the pointer (or focused): one tooltip over the whole page,
// so the chat's scrolling lists don't cut it off, nudged in from the screen's edges
export const ChatTips = () => {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const show = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.("[data-tip]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      setTip({ text: el.getAttribute("data-tip") ?? "", x: r.left + r.width / 2, y: r.top - 6 });
    };
    const hide = () => setTip(null);
    const leave = (e: Event) => (e.target as Element | null)?.closest?.("[data-tip]") && hide();
    addEventListener("pointerover", show);
    addEventListener("pointerout", leave);
    addEventListener("focusin", show);
    addEventListener("focusout", leave);
    addEventListener("pointerdown", hide);
    addEventListener("scroll", hide, true);
    return () => {
      removeEventListener("pointerover", show);
      removeEventListener("pointerout", leave);
      removeEventListener("focusin", show);
      removeEventListener("focusout", leave);
      removeEventListener("pointerdown", hide);
      removeEventListener("scroll", hide, true);
    };
  }, []);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !tip) return;
    el.style.left = `${Math.min(Math.max(8, tip.x - el.offsetWidth / 2), innerWidth - el.offsetWidth - 8)}px`;
  }, [tip]);
  return tip && createPortal(<span ref={ref} className={styles.tip} style={{ top: tip.y, left: tip.x }} role="tooltip">{tip.text}</span>, document.body);
};

// a pop for each new line (yours a lighter one), once the chat's history is in
export const useChatPops = (lines: ChatLine[], me: string) => {
  const heard = useRef<string | null>(null);
  useEffect(() => {
    const last = lines[lines.length - 1];
    if (!last) return;
    if (heard.current !== null && last.id !== heard.current) play(last.by === me ? "send" : "chat");
    heard.current = last.id;
  }, [lines, me]);
};

// one line: who said it (an eye by a spectator), what they said, and for the host, a way to remove a
// spectator from the show
export const ChatBubble = ({ line, me, onRemove }: { line: ChatLine; me: string; onRemove?: (line: ChatLine) => void }) => (
  <li className={`${styles.bubble}${line.by === me ? ` ${styles.mine}` : ""}`} style={{ "--who": line.color === null ? "#8a86c9" : PLAYER_COLORS[line.color % PLAYER_COLORS.length] } as CSSProperties}>
    <span className={styles.name}>
      {line.name}
      {line.watching && (
        <span className={styles.watching} title="Watching" aria-label="watching">
          <Icon name="eye" strokeWidth={2.2} />
        </span>
      )}
    </span>
    <ChatText text={line.text} />
    {onRemove && line.watching && line.by !== me && (
      <button type="button" className={styles.remove} onClick={() => onRemove(line)} aria-label={`Remove ${line.name} from the show`} title="Remove from the show">
        <Icon name="removePerson" strokeWidth={2.2} />
      </button>
    )}
  </li>
);

// the box to write a line in: the cast's faces to pick from, a word when it's too fast, and send
export const ChatInput = ({ send, slow, autoFocus }: { send: (msg: ClientMessage) => void; slow: number; autoFocus?: boolean }) => {
  const [draft, setDraft] = useState("");
  const [picking, setPicking] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [warn, setWarn] = useState(false);
  // (the connection's down: nothing to send it down)
  const offline = useOffline();
  // the last line sent: turned back for coming too fast, it's put back in the box to send again
  const sent = useRef("");
  // (too fast: a word, for a moment)
  useEffect(() => {
    if (!slow) return;
    setWarn(true);
    setDraft((d) => d || sent.current);
    const t = setTimeout(() => setWarn(false), 2500);
    return () => clearTimeout(t);
  }, [slow]);
  // (Escape puts the faces away first)
  useEffect(() => {
    if (!picking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      setPicking(false);
    };
    addEventListener("keydown", onKey, true);
    return () => removeEventListener("keydown", onKey, true);
  }, [picking]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || offline) return;
    send({ t: "chat", text });
    sent.current = text;
    setDraft("");
    setPicking(false);
  };
  const addEmoji = (name: string) => {
    setDraft((d) => (d + (d && !d.endsWith(" ") ? " " : "") + `:${name}: `).slice(0, CHAT_MAX * 2));
    input.current?.focus();
  };

  return (
    <>
      {picking && (
        <div className={styles.picker} role="listbox" aria-label="Character emoji">
          {CHAT_EMOJI.map((e) => (
            <button key={e} type="button" role="option" aria-selected={false} onClick={() => addEmoji(e)} aria-label={emojiName(e)} data-tip={emojiName(e)}>
              <img src={emojiSrc(e)} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      )}

      {warn && <p className={styles.slow}>Whoa, slow down a little!</p>}
      <form className={styles.form} onSubmit={submit}>
        <button type="button" className={`${styles.faceButton}${picking ? ` ${styles.faceOn}` : ""}`} onClick={() => setPicking((p) => !p)} aria-label="Character emoji" aria-expanded={picking}>
          <img src={emojiSrc("bizzHappy")} alt="" draggable={false} />
        </button>
        <input
          ref={input}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, CHAT_MAX * 2))}
          placeholder="Say something…"
          aria-label="Your message"
          maxLength={CHAT_MAX * 2}
          autoFocus={autoFocus}
          disabled={offline}
        />
        <button type="submit" className={styles.sendButton} disabled={!draft.trim() || offline} aria-label="Send">
          <Icon name="forward" strokeWidth={2.6} />
        </button>
      </form>
    </>
  );
};

// the host, sure they want a spectator out
export const RemoveWatcher = ({ line, send, onClose }: { line: ChatLine; send: (msg: ClientMessage) => void; onClose: () => void }) => (
  <Confirm
    title={`Remove ${line.name}?`}
    text="They’ll be taken out of the show, what they’ve said goes from the chat, and they can’t come back to this room."
    action="Remove"
    icon="removePerson"
    onConfirm={() => {
      send({ t: "removeWatcher", id: line.by });
      onClose();
    }}
    onClose={onClose}
  />
);

interface ChatProps {
  lines: ChatLine[];
  me: string;
  send: (msg: ClientMessage) => void;
  slow: number; // when a line was last turned back for coming too fast
  isHost: boolean; // (the host can remove a spectator, from what they've said)
}

// (in the waiting room: the chat in its own corner; at the table, it's on the phone)
const Chat = ({ lines, me, send, slow, isHost }: ChatProps) => {
  const [removing, setRemoving] = useState<ChatLine | null>(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => lines[lines.length - 1]?.id ?? null);
  const list = useRef<HTMLOListElement>(null);
  const panel = useRef<HTMLElement>(null);
  useChatPops(lines, me);
  // (beside the page, not over it: focus goes into it, Tab goes round in it once there, Escape closes
  // it and focus goes back to the chat button)
  useDialogFocus(panel, () => setOpen(false), { open, modal: false });

  // what's not been seen (lines from others since the panel was last open)
  const lastSeen = lines.findIndex((l) => l.id === seen);
  const unread = open ? 0 : lines.slice(lastSeen + 1).filter((l) => l.by !== me).length;
  useEffect(() => {
    if (open) setSeen(lines[lines.length - 1]?.id ?? null);
  }, [open, lines]);
  // (the newest line in view)
  useEffect(() => {
    if (open) list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [open, lines]);

  return (
    <>
      <button type="button" className={`${styles.toggle}${open ? ` ${styles.toggleOn}` : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`Chat${unread ? `, ${unread} new` : ""}`}>
        <Icon name={open ? "close" : "chat"} strokeWidth={2.2} />
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <section ref={panel} className={styles.panel} role="dialog" aria-label="Chat">
          <header className={styles.head}>
            <b>Chat</b>
          </header>
          <ol ref={list} className={styles.lines} aria-live="polite">
            {lines.length === 0 && <li className={styles.empty}>Say hi! 👋</li>}
            {lines.map((l) => (
              <ChatBubble key={l.id} line={l} me={me} onRemove={isHost ? setRemoving : undefined} />
            ))}
          </ol>
          <ChatInput send={send} slow={slow} autoFocus />
        </section>
      )}

      {open && <ChatTips />}
      {removing && <RemoveWatcher line={removing} send={send} onClose={() => setRemoving(null)} />}
    </>
  );
};

export default Chat;
