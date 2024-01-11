import React from "react";

import CustomHelmet from "./utils/CustomHelmet.js";

const MetaTags = (props) => {
  let splashImage = "/images/main.jpg";
  let description =
    "A collaborative storytelling game set in a fictional reality TV show. Play as a mythical creature, complete chaotic character arcs, and achieve high ratings for the season!";
  let title = "Love, Career & Magic - 12 minute game for 2-6 players";

  return (
    <CustomHelmet
      title={title}
      splashImage={splashImage}
      description={description}
    />
  );
};

export default MetaTags;
