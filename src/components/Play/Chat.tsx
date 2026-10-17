import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { CHAT_EMOJI, CHAT_MAX, type ChatLine, type ClientMessage } from "../../../game-server/src/protocol";
import Icon from "../utils/Icons";
import Confirm from "./Confirm";
import { play } from "./sounds";
import { PLAYER_COLORS } from "./GameTable";
import styles from "../../css/pages/chat.module.css";

// The room's chat, for players and spectators alike: a button in the corner (a count on it of lines
// not yet seen), and a panel with the lines and a box to write one. The cast's own emoji go in with
// the face button, written as :name: and shown as their pictures.

const emojiSrc = (name: string) => `/images/emojis/${name}.webp`;
const KNOWN = new Set<string>(CHAT_EMOJI);

// a line's text, its :emoji: as pictures (a line of nothing but emoji, bigger)
const Text = ({ text }: { text: string }) => {
  const parts = text.split(/(:[A-Za-z]+:)/g).filter(Boolean);
  const onlyEmoji = parts.every((p) => /^:[A-Za-z]+:$/.test(p) ? KNOWN.has(p.slice(1, -1)) : !p.trim());
  return (
    <span className={onlyEmoji ? styles.bigEmoji : undefined}>
      {parts.map((p, i) => {
        const m = p.match(/^:([A-Za-z]+):$/);
        return m && KNOWN.has(m[1]) ? <img key={i} className={styles.emoji} src={emojiSrc(m[1])} alt={p} title={p} draggable={false} /> : <span key={i}>{p}</span>;
      })}
    </span>
  );
};

interface ChatProps {
  lines: ChatLine[];
  me: string;
  send: (msg: ClientMessage) => void;
  slow: number; // when a line was last turned back for coming too fast
  isHost: boolean; // (the host can remove a spectator, from what they've said)
}

const Chat = ({ lines, me, send, slow, isHost }: ChatProps) => {
  const [removing, setRemoving] = useState<ChatLine | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [picking, setPicking] = useState(false);
  const [seen, setSeen] = useState(() => lines[lines.length - 1]?.id ?? null);
  const list = useRef<HTMLOListElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [warn, setWarn] = useState(false);

  // what's not been seen (lines from others since the panel was last open)
  const lastSeen = lines.findIndex((l) => l.id === seen);
  const unread = open ? 0 : lines.slice(lastSeen + 1).filter((l) => l.by !== me).length;
  useEffect(() => {
    if (open) setSeen(lines[lines.length - 1]?.id ?? null);
  }, [open, lines]);
  // a pop for each new line (yours a lighter one), once the chat's history is in
  const heard = useRef<string | null>(null);
  useEffect(() => {
    const last = lines[lines.length - 1];
    if (!last) return;
    if (heard.current !== null && last.id !== heard.current) play(last.by === me ? "send" : "chat");
    heard.current = last.id;
  }, [lines, me]);
  // (the newest line in view)
  useEffect(() => {
    if (open) list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [open, lines]);
  // (too fast: a word, for a moment)
  useEffect(() => {
    if (!slow) return;
    setWarn(true);
    const t = setTimeout(() => setWarn(false), 2500);
    return () => clearTimeout(t);
  }, [slow]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (picking ? setPicking(false) : setOpen(false));
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, picking]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    send({ t: "chat", text });
    setDraft("");
    setPicking(false);
  };
  const addEmoji = (name: string) => {
    setDraft((d) => (d + (d && !d.endsWith(" ") ? " " : "") + `:${name}: `).slice(0, CHAT_MAX * 2));
    input.current?.focus();
  };

  return (
    <>
      <button type="button" className={`${styles.toggle}${open ? ` ${styles.toggleOn}` : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`Chat${unread ? `, ${unread} new` : ""}`}>
        <Icon name={open ? "close" : "chat"} strokeWidth={2.2} />
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <section className={styles.panel} aria-label="Chat">
          <header className={styles.head}>
            <b>Chat</b>
          </header>
          <ol ref={list} className={styles.lines} aria-live="polite">
            {lines.length === 0 && <li className={styles.empty}>Say hi! 👋</li>}
            {lines.map((l) => (
              <li key={l.id} className={l.by === me ? styles.mine : undefined} style={{ "--who": l.color === null ? "#8a86c9" : PLAYER_COLORS[l.color % PLAYER_COLORS.length] } as CSSProperties}>
                <span className={styles.name}>
                  {l.name}
                  {l.watching && (
                    <span className={styles.watching} title="Watching" aria-label="watching">
                      <Icon name="eye" strokeWidth={2.2} />
                    </span>
                  )}
                </span>
                <Text text={l.text} />
                {isHost && l.watching && l.by !== me && (
                  <button type="button" className={styles.remove} onClick={() => setRemoving(l)} aria-label={`Remove ${l.name} from the show`} title="Remove from the show">
                    <Icon name="removePerson" strokeWidth={2.2} />
                  </button>
                )}
              </li>
            ))}
          </ol>

          {picking && (
            <div className={styles.picker} role="listbox" aria-label="Character emoji">
              {CHAT_EMOJI.map((e) => (
                <button key={e} type="button" role="option" aria-selected={false} onClick={() => addEmoji(e)} title={`:${e}:`}>
                  <img src={emojiSrc(e)} alt={`:${e}:`} loading="lazy" draggable={false} />
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
              autoFocus
            />
            <button type="submit" className={styles.sendButton} disabled={!draft.trim()} aria-label="Send">
              <Icon name="forward" strokeWidth={2.6} />
            </button>
          </form>
        </section>
      )}

      {removing && (
        <Confirm
          title={`Remove ${removing.name}?`}
          text="They’ll be taken out of the show, what they’ve said goes from the chat, and they can’t come back to this room."
          action="Remove"
          icon="removePerson"
          onConfirm={() => {
            send({ t: "removeWatcher", id: removing.by });
            setRemoving(null);
          }}
          onClose={() => setRemoving(null)}
        />
      )}
    </>
  );
};

export default Chat;
