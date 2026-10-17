import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ByeReason, ChatLine, ClientMessage, RoomError, RoomView, ServerMessage } from "../../../game-server/src/protocol";
import { socketUrl } from "./gameServer";

export type RoomStatus = "connecting" | "open" | "reconnecting" | "refused" | "gone";

// (how often the keep-alive goes, and how long the room has to answer it before the connection's
// taken for dead: a phone that's changed networks, say, can keep a socket "open" that goes nowhere)
const PING_EVERY = 25_000;
const PONG_WAIT = 10_000;
// (how long without the room before the page says it can't reach it)
const UNREACHABLE_AFTER = 10_000;

// A game room's socket: the room as the server last sent it, and a way to send it moves. A dropped
// socket comes back on its own (sooner when the page is looked at again or the network returns), and
// so does one that's gone quiet (no answer to the keep-alive); one the room refused or closed for good
// doesn't. `connected` is the one word on whether a move would get there: while it's false, the
// page's controls are off (see Live).
export default function useRoom(code: string | null, name: string, watch = false) {
  const [room, setRoom] = useState<RoomView | null>(null);
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [error, setError] = useState<RoomError | null>(null);
  const [bye, setBye] = useState<ByeReason | null>(null);
  const ws = useRef<WebSocket | null>(null);
  // the room's chat, and when a line was last turned back for coming too fast
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [chatSlow, setChatSlow] = useState(0);
  // this player's public id, as the room tells it (what the room's players, picks, hands and chat
  // lines are keyed by)
  const [me, setMe] = useState("");
  // (the name to open the socket with: kept up to date, so a reconnect after a rename keeps it)
  const nameRef = useRef(name);
  nameRef.current = name;
  // nothing from the room for a while (it's down, or something's blocking it): the page says so
  const [unreachable, setUnreachable] = useState(false);
  // (try again now: from the page's Retry)
  const kick = useRef<() => void>(() => {});
  // (a keep-alive now, to check the line: from a move sent)
  const check = useRef<() => void>(() => {});

  useEffect(() => {
    if (!code) return;
    let done = false; // refused, closed for good, or the page left
    let tries = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let ping: ReturnType<typeof setInterval> | undefined;
    let pong: ReturnType<typeof setTimeout> | undefined;
    let lost: ReturnType<typeof setTimeout> | undefined;
    let hadRoom = false;

    // not reached in a while, with no room yet to show: "can't reach the game"
    const watchForLost = () => {
      clearTimeout(lost);
      if (!hadRoom) lost = setTimeout(() => setUnreachable(true), UNREACHABLE_AFTER);
    };

    // the line's gone (closed, or dead quiet): let it go, and come back
    const drop = (socket: WebSocket) => {
      if (ws.current !== socket) return;
      ws.current = null;
      clearInterval(ping);
      clearTimeout(pong);
      pong = undefined;
      socket.onopen = socket.onmessage = socket.onclose = null;
      try {
        socket.close();
      } catch {
        // (already gone)
      }
      if (done) return;
      setStatus("reconnecting");
      // (a tab in the background doesn't keep knocking: it tries again once it's looked at)
      if (document.visibilityState === "hidden") return;
      retry = setTimeout(connect, Math.min(30_000, 500 * 2 ** tries++));
    };

    // a keep-alive, answered by the server without waking the room; no answer in time, and the
    // connection's taken for dead
    const sendPing = () => {
      const socket = ws.current;
      if (!socket || socket.readyState !== WebSocket.OPEN || pong) return;
      socket.send("ping");
      pong = setTimeout(() => drop(socket), PONG_WAIT);
    };
    check.current = sendPing;

    const connect = () => {
      clearTimeout(retry);
      if (done || ws.current) return;
      const socket = new WebSocket(socketUrl(code, nameRef.current, watch));
      ws.current = socket;
      socket.onopen = () => {
        tries = 0;
        setStatus("open");
        clearInterval(ping);
        ping = setInterval(sendPing, PING_EVERY);
      };
      socket.onmessage = (e) => {
        // (anything from the room says the line's alive)
        clearTimeout(pong);
        pong = undefined;
        if (e.data === "pong") return;
        let msg: ServerMessage;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }
        if (msg.t === "you") setMe(msg.id);
        else if (msg.t === "state") {
          hadRoom = true;
          clearTimeout(lost);
          setUnreachable(false);
          setRoom(msg.room);
        } else if (msg.t === "chatLog") setChat(msg.lines);
        else if (msg.t === "chat") setChat((all) => [...all.filter((l) => l.id !== msg.line.id), msg.line].slice(-60));
        else if (msg.t === "chatSlow") setChatSlow(Date.now());
        else if (msg.t === "watching") setRoom((r) => (r ? { ...r, watching: msg.n, watchOpen: msg.open } : r));
        else if (msg.t === "error") {
          done = true;
          clearTimeout(lost);
          setError(msg.error);
          setStatus("refused");
        } else if (msg.t === "bye") {
          done = true;
          clearTimeout(lost);
          setBye(msg.reason);
          setStatus("gone");
          drop(socket);
        }
      };
      socket.onclose = () => drop(socket);
    };

    const soon = () => {
      if (done) return;
      if (!ws.current) {
        tries = 0;
        connect();
      } else sendPing(); // (back on the network, or looked at again: is the line still there?)
    };
    kick.current = () => {
      setUnreachable(false);
      watchForLost();
      soon();
    };
    // a tab left in the background for a long while lets go of the room (so it isn't kept open, and
    // kept pinging, by a forgotten tab); it's back the moment it's looked at
    let away: ReturnType<typeof setTimeout> | undefined;
    const onVisible = () => {
      clearTimeout(away);
      if (document.visibilityState === "visible") soon();
      else
        away = setTimeout(() => ws.current && drop(ws.current), 10 * 60 * 1000);
    };

    setStatus("connecting");
    setError(null);
    setBye(null);
    setUnreachable(false);
    watchForLost();
    connect();
    window.addEventListener("online", soon);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      done = true;
      clearTimeout(retry);
      clearTimeout(away);
      clearTimeout(lost);
      clearTimeout(pong);
      clearInterval(ping);
      window.removeEventListener("online", soon);
      document.removeEventListener("visibilitychange", onVisible);
      const socket = ws.current;
      if (socket) drop(socket);
    };
  }, [code, watch]);

  const send = useCallback((msg: ClientMessage) => {
    if (ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify(msg));
    // (and is anyone there? a move into a dead line is noticed in seconds, not at the next keep-alive)
    check.current();
  }, []);
  const retry = useCallback(() => kick.current(), []);

  return { room, status, connected: status === "open", unreachable, retry, error, bye, send, chat, chatSlow, me };
}

// whether this page's room connection is down right now (so moves wouldn't get there): from useRoom's
// `connected`, for the controls that send them
export const RoomOffline = createContext(false);
export const useOffline = () => useContext(RoomOffline);
