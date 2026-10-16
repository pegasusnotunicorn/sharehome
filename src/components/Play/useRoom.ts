import { useCallback, useEffect, useRef, useState } from "react";
import type { ByeReason, ClientMessage, RoomError, RoomView, ServerMessage } from "../../../game-server/src/protocol";
import { socketUrl } from "./gameServer";

export type RoomStatus = "connecting" | "open" | "reconnecting" | "refused" | "gone";

// A game room's socket: the room as the server last sent it, and a way to send it moves. A dropped
// socket comes back on its own (sooner when the page is looked at again or the network returns);
// one the room refused or closed for good doesn't.
export default function useRoom(code: string | null, name: string) {
  const [room, setRoom] = useState<RoomView | null>(null);
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [error, setError] = useState<RoomError | null>(null);
  const [bye, setBye] = useState<ByeReason | null>(null);
  const ws = useRef<WebSocket | null>(null);
  // (the name the socket first opens with: changes after that go as a rename)
  const nameRef = useRef(name);

  useEffect(() => {
    if (!code) return;
    let done = false; // refused, closed for good, or the page left
    let tries = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let ping: ReturnType<typeof setInterval> | undefined;

    const connect = () => {
      clearTimeout(retry);
      if (done || (ws.current && ws.current.readyState <= WebSocket.OPEN)) return;
      const socket = new WebSocket(socketUrl(code, nameRef.current));
      ws.current = socket;
      socket.onopen = () => {
        tries = 0;
        setStatus("open");
        clearInterval(ping);
        // (a keep-alive, answered by the server without waking the room; just often enough that phones
        // and proxies don't drop a quiet connection)
        ping = setInterval(() => socket.readyState === WebSocket.OPEN && socket.send("ping"), 45_000);
      };
      socket.onmessage = (e) => {
        if (e.data === "pong") return;
        let msg: ServerMessage;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }
        if (msg.t === "state") setRoom(msg.room);
        else if (msg.t === "error") {
          done = true;
          setError(msg.error);
          setStatus("refused");
        } else if (msg.t === "bye") {
          done = true;
          setBye(msg.reason);
          setStatus("gone");
          socket.close();
        }
      };
      socket.onclose = () => {
        clearInterval(ping);
        if (ws.current === socket) ws.current = null;
        if (done) return;
        setStatus("reconnecting");
        // (a tab in the background doesn't keep knocking: it tries again once it's looked at)
        if (document.visibilityState === "hidden") return;
        retry = setTimeout(connect, Math.min(30_000, 500 * 2 ** tries++));
      };
    };

    const soon = () => {
      if (!done && !ws.current) {
        tries = 0;
        connect();
      }
    };
    // a tab left in the background for a long while lets go of the room (so it isn't kept open, and
    // kept pinging, by a forgotten tab); it's back the moment it's looked at
    let away: ReturnType<typeof setTimeout> | undefined;
    const onVisible = () => {
      clearTimeout(away);
      if (document.visibilityState === "visible") soon();
      else
        away = setTimeout(() => {
          clearTimeout(retry);
          ws.current?.close();
          ws.current = null;
        }, 10 * 60 * 1000);
    };

    setStatus("connecting");
    setError(null);
    setBye(null);
    connect();
    window.addEventListener("online", soon);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      done = true;
      clearTimeout(retry);
      clearTimeout(away);
      clearInterval(ping);
      window.removeEventListener("online", soon);
      document.removeEventListener("visibilitychange", onVisible);
      ws.current?.close();
      ws.current = null;
    };
  }, [code]);

  const send = useCallback((msg: ClientMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(msg));
  }, []);

  return { room, status, error, bye, send };
}
