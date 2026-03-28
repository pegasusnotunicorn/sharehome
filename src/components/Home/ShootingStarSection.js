import ShootingStar from "../Navbar/ShootingStar.js";
import landingPageStyles from "../../css/landingPage.module.css";
import shootingStarStyles from "../../css/utils/shootingStar.module.css";
import "../../css/utils/colors.css";

export default function ShootingStarSection() {
  return (
    <div id={`${landingPageStyles.shootingStarsContainer}`}>
      <div id={`${landingPageStyles.shootingStarsWrapper}`}>
        {Array.from({ length: 10 }).map((_, i) => (
          <ShootingStar
            key={i}
            className={i % 2 === 0 ? shootingStarStyles.leftStar : shootingStarStyles.rightStar}
            isActive
            orientation={["left", "up", "right", "down"][i % 4]}
            mirror={i % 2 === 0 ? "mirror" : ""}
            delay={i * 2}
          />
        ))}
      </div>
    </div>
  );
}
