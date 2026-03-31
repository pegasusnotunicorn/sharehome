interface GameModeIconsProps {
  playerCount: string;
  playTime: string;
  className?: string;
}

//the player count and the total play time icons
const GameModeIcons = (props: GameModeIconsProps) => {
  let extraClasses = props.className ? props.className : "";
  let classes = `timePlayerInfoWrapper ${extraClasses}`;

  return (
    <div className={classes}>
      <div>
        <img
          loading="lazy"
          src="/images/icons/playercount.svg"
          alt="Player Count"
        />
        {props.playerCount}
      </div>
      <div>
        <img loading="lazy" src="/images/icons/sandclock.svg" alt="Time" />
        {props.playTime}
      </div>
    </div>
  );
};

export default GameModeIcons;
