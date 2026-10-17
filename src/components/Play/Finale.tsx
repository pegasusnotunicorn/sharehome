import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DIRECTION_POINTS, arcDone, score, type ClientMessage, type GameView, type RoomView } from "../../../game-server/src/protocol";
import DefaultButton from "../utils/DefaultButton";
import { sized, srcSet } from "../utils/imageCopies";
import styles from "../../css/pages/finale.module.css";

// The season's over: the ratings, as a season poster. The cast at the kitchen table behind the
// rating, an award rosette with the score, everyone's character with their arc, the four episodes,
// confetti, and ways to share it: a picture made on the spot (to copy, save or share) and links.

const nn = (i: number) => String(i + 1).padStart(2, "0");
const characterArt = (i: number) => `/images/pieces/characters/${nn(i)}.webp`;
const episodeArt = (i: number) => `/images/pieces/episodes/${nn(i)}.webp`;
const PLAYER_COLORS = ["#d81e18", "#5f5aa2", "#4f8a73", "#e0a91b", "#3d7fb8", "#d9652b"];
const SITE = "https://lovecareermagic.com/play";
// the key art (its 1000px copy, unless the screen needs more)
const SPLASH = "/images/illustrations/splash.webp";
const SPLASH_SMALL = sized(SPLASH, 1000);

// #region--------------------------------------CONFETTI

const CONFETTI = ["#d81e18", "#f1db4b", "#5f5aa2", "#4f8a73", "#3d7fb8", "#e88aa8", "#ffffff"];

const Confetti = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    };
    size();
    addEventListener("resize", size);
    // two bursts from the bottom corners, then a gentle fall from the top
    type Bit = { x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; c: string; life: number };
    const bits: Bit[] = [];
    const burst = (x: number, dir: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = (-Math.PI / 2) + dir * (0.15 + Math.random() * 0.55);
        const v = 14 + Math.random() * 12;
        bits.push({ x, y: innerHeight, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: CONFETTI[i % CONFETTI.length], life: 0 });
      }
    };
    burst(0, 1, 110);
    burst(innerWidth, -1, 110);
    let rain = 0;
    let frame = 0;
    const tick = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (rain < 140 && frame % 2 === 0) {
        rain++;
        bits.push({ x: Math.random() * innerWidth, y: -20, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 2, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, w: 6 + Math.random() * 5, h: 8 + Math.random() * 7, c: CONFETTI[rain % CONFETTI.length], life: 0 });
      }
      for (const b of bits) {
        b.vy += 0.32;
        b.vx *= 0.985;
        b.vy = Math.min(b.vy, 5.5);
        b.x += b.vx + Math.sin((frame + b.r * 40) / 18) * 0.6;
        b.y += b.vy;
        b.r += b.vr;
        b.life++;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.scale(1, Math.cos(b.life / 7));
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      for (let i = bits.length - 1; i >= 0; i--) if (bits[i].y > innerHeight + 40) bits.splice(i, 1);
      frame++;
      if (bits.length || rain < 140) raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, []);
  return <canvas ref={ref} className={styles.confetti} aria-hidden />;
};

// #endregion

// #region--------------------------------------THE SHARE PICTURE

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const wrap = (ctx: CanvasRenderingContext2D, text: string, max: number) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

// a 1080 × 1350 picture (the shape Instagram and the rest like): the key art, the rating, the score,
// and the cast
async function drawShare(rating: string, perPlayer: number, cast: { name: string; character: number; color: string }[]) {
  await Promise.all([document.fonts.load('80px "Rowdies-Bold"'), document.fonts.load('40px "Rowdies-Regular"'), document.fonts.load('30px "GochiHand"')]);
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // the night, lit from above
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#2a2550");
  bg.addColorStop(1, "#16141f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 520, 40, W / 2, 520, 700);
  glow.addColorStop(0, "rgba(255,226,150,0.32)");
  glow.addColorStop(1, "rgba(255,226,150,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // the key art, framed like a photo, a little askew
  const art = await load(SPLASH_SMALL);
  ctx.save();
  ctx.translate(W / 2, 330);
  ctx.rotate(-0.025);
  const aw = 860;
  const ah = (aw * art.height) / art.width;
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = "#fffaf0";
  roundRect(ctx, -aw / 2 - 16, -ah / 2 - 16, aw + 32, ah + 32, 22);
  ctx.fill();
  ctx.shadowColor = "transparent";
  roundRect(ctx, -aw / 2, -ah / 2, aw, ah, 12);
  ctx.clip();
  ctx.drawImage(art, -aw / 2, -ah / 2, aw, ah);
  ctx.restore();

  // the rating
  ctx.textAlign = "center";
  ctx.fillStyle = "#f1db4b";
  ctx.font = '30px "Rowdies-Regular"';
  ctx.fillText("T H E   R A T I N G S   A R E   I N", W / 2, 700);
  ctx.fillStyle = "#ffffff";
  ctx.font = '84px "Rowdies-Bold"';
  const lines = wrap(ctx, rating, 940);
  lines.forEach((l, i) => {
    ctx.shadowColor = "rgba(143,20,16,1)";
    ctx.shadowOffsetY = 7;
    ctx.fillText(l, W / 2, 800 + i * 92);
  });
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetY = 0;
  const y = 800 + (lines.length - 1) * 92 + 90;

  // the score, on a yellow ribbon
  ctx.font = '40px "Rowdies-Bold"';
  const scoreText = `${perPlayer} points per player`;
  const sw = ctx.measureText(scoreText).width + 70;
  ctx.fillStyle = "#f1db4b";
  roundRect(ctx, W / 2 - sw / 2, y - 46, sw, 70, 35);
  ctx.fill();
  ctx.fillStyle = "#323232";
  ctx.fillText(scoreText, W / 2, y + 2);

  // the cast
  const imgs = await Promise.all(cast.slice(0, 6).map((c) => load(characterArt(c.character)).catch(() => null)));
  const n = imgs.length;
  const cw = Math.min(250, (W - 120 - (n - 1) * 18) / n);
  const ch = cw * (444 / 768);
  const startX = W / 2 - (n * cw + (n - 1) * 18) / 2;
  const cy = y + 70;
  imgs.forEach((img, i) => {
    const x = startX + i * (cw + 18);
    ctx.save();
    ctx.translate(x + cw / 2, cy + ch / 2);
    ctx.rotate(((i % 2 ? 1 : -1) * (2 + (i % 3))) / 100);
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#fffaf0";
    roundRect(ctx, -cw / 2 - 6, -ch / 2 - 6, cw + 12, ch + 12, 12);
    ctx.fill();
    ctx.shadowColor = "transparent";
    if (img) {
      roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 8);
      ctx.save();
      ctx.clip();
      ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch);
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = cast[i].color;
    ctx.font = '26px "Rowdies-Regular"';
    ctx.fillText(cast[i].name, x + cw / 2, cy + ch + 44);
  });

  // where to play
  ctx.fillStyle = "rgba(244,239,227,0.85)";
  ctx.font = '34px "GochiHand"';
  ctx.fillText("Love, Career & Magic · play online at lovecareermagic.com/play", W / 2, H - 50);

  return new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

// #endregion

const Finale = ({ room, game, isHost, send }: { room: RoomView; game: GameView; isHost: boolean; send: (msg: ClientMessage) => void }) => {
  const s = score(game);
  const host = room.players.find((p) => p.id === room.hostId);
  const cast = room.players
    .filter((p) => game.hands[p.id])
    .map((p) => ({ name: p.name, character: game.hands[p.id].character, color: PLAYER_COLORS[p.color % PLAYER_COLORS.length], arc: arcDone(game.hands[p.id]), traits: game.hands[p.id].traits.filter((t) => t.done !== null).length }));
  const episodes = game.episodes.map((e) => ({
    card: e.card,
    points: e.tokens + e.completed.reduce((n, c) => n + DIRECTION_POINTS[c.deck] + c.tokens, 0),
  }));

  // the picture, made once
  const [picture, setPicture] = useState<{ blob: Blob; url: string } | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => {
    let live = true;
    drawShare(s.rating, s.perPlayer, cast)
      .then((blob) => live && setPicture({ blob, url: URL.createObjectURL(blob) }))
      .catch(() => {});
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(
    () => () => {
      if (picture) URL.revokeObjectURL(picture.url);
    },
    [picture]
  );

  const flash = (text: string) => {
    setNote(text);
    setTimeout(() => setNote(""), 2200);
  };
  const text = `Our season of Love, Career & Magic got rated “${s.rating.replace(/\.$/, "")}”: ${s.perPlayer} points per player! 📺✨`;
  const enc = encodeURIComponent;
  const links = [
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(SITE)}`, icon: "social-icon-twitter" },
    { name: "Bluesky", href: `https://bsky.app/intent/compose?text=${enc(`${text} ${SITE}`)}`, icon: "social-icon-bluesky" },
    { name: "Threads", href: `https://www.threads.net/intent/post?text=${enc(`${text} ${SITE}`)}`, icon: "social-icon-threads" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(SITE)}&quote=${enc(text)}`, icon: "social-icon-facebook" },
    { name: "Reddit", href: `https://www.reddit.com/submit?url=${enc(SITE)}&title=${enc(text)}`, icon: null },
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${SITE}`)}`, icon: null },
  ];
  const file = picture && new File([picture.blob], "love-career-magic-season.png", { type: "image/png" });
  const canShareFile = !!file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

  return (
    <section className={styles.finale}>
      <Confetti />

      {/* #region the poster */}
      <div className={styles.poster}>
        <img className={styles.posterArt} src={SPLASH_SMALL} srcSet={srcSet(SPLASH)} sizes="(max-width: 760px) 100vw, 1000px" alt="" />
        <div className={styles.posterShade} />
        <div className={styles.posterText}>
          <p className={styles.kicker}>{game.outOfCards ? "That’s a wrap!" : "Season finale"} · the ratings are in</p>
          <h2 className={styles.rating}>{s.rating}</h2>
          <div className={styles.rosette} aria-label={`${s.perPlayer} points per player`}>
            <span className={styles.rosetteRibbons} aria-hidden />
            <span className={styles.rosetteFace}>
              <b>{s.perPlayer}</b>
              <small>points per player</small>
            </span>
          </div>
        </div>
      </div>
      {/* #endregion */}

      {/* #region the cast */}
      {/* (in even rows: up to four on one, five or six as rows of three) */}
      <div className={styles.cast} style={{ "--per": cast.length <= 4 ? cast.length : 3 } as CSSProperties}>
        {cast.map((c, i) => (
          <figure key={c.name + i} className={styles.castCard} style={{ "--seat": c.color, "--r": `${(i % 2 ? 1 : -1) * (1.5 + (i % 3))}deg`, "--d": `${0.4 + i * 0.12}s` } as CSSProperties}>
            <img src={characterArt(c.character)} alt="" width="768" height="444" />
            <figcaption>
              <b>{c.name}</b>
              <span>{c.arc ? "Character Arc +10 ★" : `${c.traits} of 3 traits`}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {/* #endregion */}

      {/* #region the season: its episodes, and how the points add up */}
      <div className={styles.season}>
        <div className={styles.episodes}>
          {episodes.map((e, i) => (
            <figure key={i} className={styles.episode} style={{ "--r": `${(i % 2 ? 1 : -1) * 2}deg` } as CSSProperties}>
              <img src={episodeArt(e.card)} alt="" width="768" height="549" />
              <figcaption>
                Ep {i + 1} <b>+{e.points}</b>
              </figcaption>
            </figure>
          ))}
        </div>
        <dl className={styles.sums}>
          <div>
            <dt>Direction cards</dt>
            <dd>{s.cards}</dd>
          </div>
          <div>
            <dt>Tokens</dt>
            <dd>{s.tokens}</dd>
          </div>
          <div>
            <dt>Character Arcs</dt>
            <dd>{s.arcs}</dd>
          </div>
          <div className={styles.sumTotal}>
            <dt>Total ÷ {s.players}</dt>
            <dd>{s.perPlayer}</dd>
          </div>
        </dl>
      </div>
      {/* #endregion */}

      {/* #region sharing */}
      <div className={styles.share}>
        <div className={styles.sharePreview}>
          {picture ? <img src={picture.url} alt={`Our season: ${s.rating}`} /> : <span className={styles.shareLoading} />}
        </div>
        <div className={styles.shareSide}>
          <h3>Brag about it</h3>
          <div className={styles.shareMain}>
            {canShareFile && (
              <DefaultButton
                onClick={() => navigator.share({ files: [file!], text, url: SITE }).catch(() => {})}
                text="Share…"
                icon="share"
                color="red"
              />
            )}
            <DefaultButton
              onClick={async () => {
                if (!picture) return;
                try {
                  await navigator.clipboard.write([new ClipboardItem({ "image/png": picture.blob })]);
                  flash("Picture copied!");
                } catch {
                  flash("Couldn’t copy: save it instead");
                }
              }}
              text="Copy picture"
              icon="image"
              loading={!picture}
              color={canShareFile ? "white" : "red"}
              variant={canShareFile ? "secondary" : "primary"}
              border={canShareFile ? "dark" : undefined}
            />
            <DefaultButton
              onClick={() => {
                if (!picture) return;
                const a = document.createElement("a");
                a.href = picture.url;
                a.download = "love-career-magic-season.png";
                a.click();
              }}
              text="Save picture"
              icon="download"
              loading={!picture}
              variant="secondary"
              border="dark"
            />
            <DefaultButton
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${text} ${SITE}`);
                  flash("Copied!");
                } catch {
                  flash("Couldn’t copy");
                }
              }}
              text="Copy text"
              icon="copy"
              variant="secondary"
              border="dark"
            />
          </div>
          <div className={styles.socials}>
            {links.map((l) => (
              <a key={l.name} href={l.href} target="_blank" rel="noreferrer" className={styles.social} aria-label={`Share on ${l.name}`} title={l.name}>
                {l.icon ? (
                  <svg aria-hidden>
                    <use href={`#${l.icon}`} />
                  </svg>
                ) : (
                  <span>{l.name === "Reddit" ? "r/" : "W"}</span>
                )}
              </a>
            ))}
          </div>
          <span className={styles.shareNote} role="status">
            {note}
          </span>
        </div>
      </div>
      {/* #endregion */}

      <div className={styles.again}>
        {isHost ? (
          <DefaultButton onClick={() => send({ t: "toLobby" })} text="Another season!" icon="again" color="yellow" />
        ) : (
          <p>{host?.name || "The host"} can start another season.</p>
        )}
      </div>
    </section>
  );
};

export default Finale;
