interface GameModeDetailsProps {
  name: string;
  description: string;
}

//the subtitle with the description and the title in how-to-play page
const GameModeDetails = (props: GameModeDetailsProps) => {
  return (
    <div className="subcontentWrapper margin-top">
      <div className="characterContent">
        <h2 className="subtitle">{props.name}</h2>
        <p>{props.description}</p>
        <a
          href="/rulebook.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4em", color: "#323232" }}
        >
          <img
            loading="lazy"
            src="/images/icons/rulebook.svg"
            alt=""
            style={{ width: "20px", height: "20px" }}
          />
          Click here for the rulebook PDF
        </a>
      </div>
    </div>
  );
};

export default GameModeDetails;
