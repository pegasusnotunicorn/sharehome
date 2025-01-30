import { useEffect } from "react";
import GameModeDetails from "./utils/GameModeDetails.js";
import Roleplay from "./components/Roleplay.js";
import "../../css/pages/aboutPage.css";

const AboutPage = () => {
  // styling for character cards on about page
  let cardStyle = {
    width: "175px",
    height: "100px",
    fontSize: "1.5px",
  };

  useEffect(() => {
    document.title = "How to play";
  });

  return (
    <div className="content max-width">
      <GameModeDetails
        name="How to play"
        description="Love, Career & Magic is a very flexible party game with multiple ways of playing. Feel free to add your own house rules to change it up!"
        playerCount="2 - 6 players"
        playTime="12 minutes"
      />
      <Roleplay cardStyle={cardStyle} />
    </div>
  );
};

export default AboutPage;
