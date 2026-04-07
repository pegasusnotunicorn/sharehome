import { GsapFadeScrub } from "../utils/useGsap";
import CarouselSection from "../utils/CarouselSection";
import landingPageStyles from "../../css/landingPage.module.css";

const testimonials = [
  {
    filename: "playthrough1",
    href: "https://www.youtube.com/watch?v=Cpvz4dzRz2c",
  },
  {
    filename: "playthrough2",
    href: "https://www.youtube.com/watch?v=ANDtl5Tgnmk",
  },
  {
    filename: "playthrough3",
    href: "https://www.youtube.com/watch?v=Bh8wjBpwSYI",
  },
  {
    filename: "playthrough4",
    href: "https://www.youtube.com/watch?v=p-oXROylaAc",
  },
  {
    filename: "playthrough5",
    href: "https://www.youtube.com/watch?v=E6zQV_ni1pE",
  },
  {
    filename: "playthrough6",
    href: "https://www.youtube.com/watch?v=AKcLhaALw8Q",
  },
  {
    filename: "playthrough7",
    href: "https://www.youtube.com/watch?v=BKUpx-Z8mrs",
  },
  {
    filename: "playthrough8",
    href: "https://www.youtube.com/watch?v=u_iFb02L0QY",
  },
  {
    filename: "playthrough9",
    href: "https://www.youtube.com/watch?v=HOGt-U67PKc",
  },
];

export default function TestimonialsSection() {
  return (
    <GsapFadeScrub
      fadeIn
      className={`${landingPageStyles.mainpageContainer} ${landingPageStyles.carouselContainer}`}
    >
      <div className={`${landingPageStyles.carouselTextContainer}`}>
        <h1 className={landingPageStyles.mainpageCarouselTitle}>
          Real players, real stories
        </h1>
      </div>
      <CarouselSection
        className={landingPageStyles.mainpageCarousel}
        directory="/images/testimonials"
        filename="playthrough"
        loop
        autoplayEnabled={false}
        mediaAspectRatio="16 / 9"
        imageFit="cover"
        specificFiles={testimonials}
      />
    </GsapFadeScrub>
  );
}
