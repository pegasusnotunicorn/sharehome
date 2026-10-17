import { useState, type CSSProperties, type ReactNode } from "react";
import WhatsInTheBox from "./WhatsInTheBox";
import DefaultButton from "../../utils/DefaultButton";
import { srcSet } from "../../utils/imageCopies";
import aboutStyles from "../../../css/pages/aboutPage.module.css";

// The How to play page's three parts (the setup, the rules, every piece in 3D), one at a time. Each step's
// a white box: a little scene of the printed pieces it's about, laid on the table, and the words.

type Tab = "setup" | "rules" | "box";

const TABS: { id: Tab; label: string; short?: string; note: string }[] = [
  { id: "setup", label: "Game setup", note: "less than 3 min" },
  { id: "rules", label: "Game rules", note: "12 min per game" },
  { id: "box", label: "What's in the box", short: "In the box", note: "every piece, in 3D" },
];

const Roleplay = () => {
  const [tab, setTab] = useState<Tab>("setup");
  const [boxOpened, setBoxOpened] = useState(false); // the pieces load the first time their tab opens, and stay

  const open = (next: Tab, scroll = false) => {
    setTab(next);
    if (next === "box") setBoxOpened(true);
    if (scroll) document.getElementById("how-to-play-parts")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className={aboutStyles.parts} id="how-to-play-parts">
      <div className={aboutStyles.tabs} role="tablist" aria-label="How to play">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            aria-selected={tab === t.id}
            className={`${aboutStyles.tab}${tab === t.id ? ` ${aboutStyles.tabActive}` : ""}`}
            onClick={() => open(t.id)}
          >
            <span className={aboutStyles.tabLabel}>
              {t.short ? (
                <>
                  <span className={aboutStyles.long}>{t.label}</span>
                  <span className={aboutStyles.short}>{t.short}</span>
                </>
              ) : (
                t.label
              )}
            </span>
            <span className={aboutStyles.tabNote}>{t.note}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-setup" aria-labelledby="tab-setup" hidden={tab !== "setup"}>
        {tab === "setup" && <Setup next={() => open("rules", true)} />}
      </div>
      <div role="tabpanel" id="panel-rules" aria-labelledby="tab-rules" hidden={tab !== "rules"}>
        {tab === "rules" && <Rules back={() => open("setup", true)} next={() => open("box", true)} />}
      </div>
      <div role="tabpanel" id="panel-box" aria-labelledby="tab-box" hidden={tab !== "box"}>
        {boxOpened && (
          <div className={aboutStyles.boxPanel}>
            <WhatsInTheBox />
          </div>
        )}
      </div>
    </section>
  );
};

// #region--------------------------------------THE PIECES

const nn = (i: number) => String(i + 1).padStart(2, "0");
const pick = (n: number) => Math.floor(Math.random() * n);
const pickSome = (n: number, k: number) => {
  const out: number[] = [];
  while (out.length < k) {
    const i = pick(n);
    if (!out.includes(i)) out.push(i);
  }
  return out;
};

const character = (i: number) => `/images/pieces/characters/${nn(i)}.webp`;
const episode = (i: number) => `/images/pieces/episodes/${nn(i)}.webp`;
const trait = (kind: "good" | "bad" | "chaotic", i: number) => `/images/pieces/${kind}-traits/${nn(i)}.webp`;
const direction = (deck: "director" | "producer" | "showrunner", i: number) => `/images/pieces/${deck}/${nn(i)}.webp`;
const TOKEN = "/images/pieces/box/token-front.webp";
const TOKEN_BACK = "/images/pieces/box/token-back.webp";
const EPISODE_BACK = "/images/pieces/episodes/back.webp";

// each piece's picture's size, so it's laid out right before it's in
const PICTURE_SIZES: [RegExp, number, number][] = [
  [/\/characters\//, 768, 444],
  [/-traits\//, 768, 219],
  [/\/episodes\//, 768, 549],
  [/\/(director|producer|showrunner)\//, 768, 497],
  [/\/token-/, 512, 512],
  [/membertalk\.svg$/, 325, 109],
  [/commentatortalk\.svg$/, 297, 127],
];
const pictureSize = (src: string) => {
  const [, width, height] = PICTURE_SIZES.find(([m]) => m.test(src)) ?? [];
  return { width, height };
};

// a piece on the table: where its middle is (of the scene's width and height), how wide (of the scene's
// width), and its turn
interface Piece {
  src: string;
  x: number;
  y: number;
  w: number;
  r?: number;
  kind?: "character" | "card" | "trait" | "token" | "art";
  alt?: string;
}

const Scene = ({ pieces, label }: { pieces: Piece[]; label: string }) => (
  <div className={aboutStyles.scene} role="img" aria-label={label}>
    {pieces.map((p, i) => (
      <img
        key={i}
        src={p.src}
        srcSet={srcSet(p.src)}
        // (its share of the scene, which is about the screen's width on phones, and about 520px wider up)
        sizes={`(max-width: 900px) ${Math.ceil(p.w * 0.92)}vw, ${Math.ceil(p.w * 5.2)}px`}
        {...pictureSize(p.src)}
        alt=""
        loading="lazy"
        draggable={false}
        className={`${aboutStyles.piece} ${aboutStyles[p.kind || "card"]}`}
        style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, "--w": `${p.w}%`, "--r": `${p.r || 0}deg`, "--i": i } as CSSProperties}
      />
    ))}
  </div>
);

// #endregion

// #region--------------------------------------A STEP

interface StepProps {
  n: number;
  eyebrow: string;
  title: string;
  lead: string;
  points: ReactNode[];
  scene: ReactNode;
  children?: ReactNode;
}

const Step = ({ n, eyebrow, title, lead, points, scene, children }: StepProps) => (
  <article className={aboutStyles.step}>
    <div className={aboutStyles.stepScene}>{scene}</div>
    <div className={aboutStyles.stepWords}>
      <p className={aboutStyles.stepEyebrow}>
        <span className={aboutStyles.stepNumber}>{n}</span>
        {eyebrow}
      </p>
      <h2 className={aboutStyles.stepTitle}>{title}</h2>
      <p className={aboutStyles.stepLead}>{lead}</p>
      <ul className={aboutStyles.points}>
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      {children}
    </div>
  </article>
);

const Footer = ({ children }: { children: ReactNode }) => <div className={aboutStyles.partFooter}>{children}</div>;

// #endregion

// #region--------------------------------------SETUP

const Setup = ({ next }: { next: () => void }) => {
  const [deal] = useState(() => ({
    you: pick(25),
    them: pickSome(25, 2),
    traits: [trait("good", pick(30)), trait("bad", pick(30)), trait("chaotic", pick(30))].sort(() => 0.5 - Math.random()),
    directions: [direction("director", pick(50)), direction("producer", pick(50)), direction("showrunner", pick(50))],
  }));

  return (
    <div className={aboutStyles.steps}>
      <Step
        n={1}
        eyebrow="Step one"
        title="Deal character cards & traits"
        lead="Each player is given a random Character Card and three random Character Traits."
        points={[
          "Place your Character Card in the plastic card standee for all to see.",
          "For Character Traits, every player receives one of each color at random.",
          "Form your Character Arc by rearranging the order of your Character Traits.",
        ]}
        scene={
          <Scene
            label="A character card and three character traits"
            pieces={[
              { src: character(deal.you), kind: "character", x: 36, y: 42, w: 62, r: -4 },
              { src: deal.traits[0], kind: "trait", x: 72, y: 62, w: 44, r: 3 },
              { src: deal.traits[1], kind: "trait", x: 70, y: 75, w: 44, r: -2 },
              { src: deal.traits[2], kind: "trait", x: 73, y: 88, w: 44, r: 1.5 },
            ]}
          />
        }
      >
        <div className={aboutStyles.goal}>
          <img loading="lazy" src="/images/icons/flag.svg" alt="" />
          <p>
            <b>The goal:</b> score points. The higher you score, the better the ratings for your season. Fulfill
            as many Direction Cards as you can as a group and complete your Character Arcs to earn points.
          </p>
        </div>
      </Step>

      <Step
        n={2}
        eyebrow="Step two"
        title="Set up the table"
        lead="Place the Episode Cards, Direction Cards, and Point Tokens in the center of the table."
        points={[
          "Every player must be able to read the cards clearly so please sit accordingly.",
          "Place a phone in clear view of everyone and set a timer for 3 minutes.",
          "Split the Direction Cards into two decks according to their point values.",
        ]}
        scene={
          <Scene
            label="Episode cards, direction cards and point tokens in the middle of the table"
            pieces={[
              { src: EPISODE_BACK, x: 26, y: 33, w: 40, r: -5 },
              { src: deal.directions[0], x: 70, y: 27, w: 40, r: 4 },
              { src: deal.directions[1], x: 63, y: 66, w: 40, r: -3 },
              { src: TOKEN, kind: "token", x: 20, y: 74, w: 13, r: 20 },
              { src: TOKEN_BACK, kind: "token", x: 31, y: 82, w: 13, r: -40 },
              { src: TOKEN, kind: "token", x: 27, y: 66, w: 13, r: 75 },
            ]}
          />
        }
      />

      <Step
        n={3}
        eyebrow="Step three"
        title="Start playing!"
        lead="Starting with the oldest Character, all players introduce themselves."
        points={[
          "Feel free to omit or replace any of the written character details as you see fit.",
          "Make sure to also mention your Character Arc so others are aware of it.",
          "Remember, this is your reality TV show debut!",
          "Continue clockwise until all players have introduced themselves.",
        ]}
        scene={
          <Scene
            label="Players introducing their characters"
            pieces={[
              { src: character(deal.them[0]), kind: "character", x: 30, y: 36, w: 50, r: -6 },
              { src: character(deal.them[1]), kind: "character", x: 70, y: 40, w: 50, r: 5 },
              { src: "/images/illustrations/rules/membertalk.svg", kind: "art", x: 50, y: 80, w: 46 },
            ]}
          />
        }
      />

      <Footer>
        <span />
        <DefaultButton variant="secondary" border="dark" iconPosition="right" icon="next" onClick={next} text="Next: the game rules" />
      </Footer>
    </div>
  );
};

// #endregion

// #region--------------------------------------RULES

const Rules = ({ back, next }: { back: () => void; next: () => void }) => {
  const [deal] = useState(() => ({
    episodes: pickSome(50, 2),
    directions: [direction("director", pick(50)), direction("producer", pick(50)), direction("showrunner", pick(50))],
  }));

  return (
    <div className={aboutStyles.steps}>
      <Step
        n={1}
        eyebrow="Episode cards"
        title="Drive the story each round"
        lead="Flip over an Episode Card. This will be the location for Episode One."
        points={[
          <>Every episode is one &quot;round&quot; of the game.</>,
          "Each episode lasts three minutes.",
          "You will play four episodes in total.",
          "Do not start the timer just yet.",
        ]}
        scene={
          <Scene
            label="An episode card, face up on the deck"
            pieces={[
              { src: EPISODE_BACK, x: 40, y: 46, w: 52, r: -6 },
              { src: episode(deal.episodes[0]), x: 56, y: 54, w: 58, r: 4 },
            ]}
          />
        }
      />

      <Step
        n={2}
        eyebrow="Direction cards"
        title="Score points by completing challenges"
        lead="Flip over three cards from both Direction Card decks. Six total cards should be face up at all times."
        points={[
          "The executives of the show are trying to instill chaos into the plot!",
          "In three minutes, complete as many Direction Cards as you can as a group.",
          "Each Direction Card is worth one or two points.",
          "Replenish a card as soon as you complete it.",
        ]}
        scene={
          <Scene
            label="Direction cards, face up"
            pieces={[
              { src: deal.directions[0], x: 27, y: 30, w: 42, r: -6 },
              { src: deal.directions[1], x: 73, y: 30, w: 42, r: 5 },
              { src: deal.directions[2], x: 50, y: 58, w: 42, r: -1 },
              { src: "/images/illustrations/rules/commentatortalk.svg", kind: "art", x: 50, y: 88, w: 34 },
            ]}
          />
        }
      />

      <Step
        n={3}
        eyebrow="Point tokens"
        title="Track your progress"
        lead="Point tokens can be used to earn extra points during the game."
        points={[
          "Anytime someone references something from a previous episode, place a Point Token on that Episode Card to earn an extra point.",
          "Just because someone else completed a Direction Card before you had a chance to speak, does not mean you lost your chance. Place a Point Token on the current Episode Card to earn an extra point and say what you wanted to say.",
        ]}
        scene={
          <Scene
            label="Point tokens on an episode card"
            pieces={[
              { src: episode(deal.episodes[1]), x: 50, y: 48, w: 66, r: -3 },
              { src: TOKEN, kind: "token", x: 28, y: 74, w: 16, r: 15 },
              { src: TOKEN_BACK, kind: "token", x: 42, y: 80, w: 16, r: -30 },
              { src: TOKEN, kind: "token", x: 73, y: 22, w: 16, r: 60 },
            ]}
          />
        }
      />

      <section className={aboutStyles.golden}>
        <header className={aboutStyles.goldenHead}>
          <p className={aboutStyles.stepEyebrow}>Always keep these in mind</p>
          <h2 className={aboutStyles.stepTitle}>Two golden rules</h2>
        </header>
        <div className={aboutStyles.goldenGrid}>
          <article className={aboutStyles.goldenRule}>
            <img loading="lazy" src="/images/illustrations/rules/commentatorpoint2.svg" alt="" />
            <h3>Everything must somehow make sense.</h3>
            <p>
              It does not matter how convoluted, far-fetched, or shoe-horned in your story is. As long as it makes
              sense, it&apos;s okay.
            </p>
          </article>
          <article className={aboutStyles.goldenRule}>
            <img loading="lazy" src="/images/illustrations/rules/reveal2.svg" alt="" />
            <h3>The golden improv rule of &quot;Yes, and...&quot;</h3>
            <p>If something is said, it is true unless it directly contradicts something else that was already said.</p>
          </article>
        </div>
      </section>

      <Footer>
        <DefaultButton variant="secondary" border="dark" icon="prev" onClick={back} text="Back to game setup" />
        <DefaultButton variant="secondary" border="dark" iconPosition="right" icon="next" onClick={next} text="See every piece in 3D" />
      </Footer>
    </div>
  );
};

// #endregion

export default Roleplay;
