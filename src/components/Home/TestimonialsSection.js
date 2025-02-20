import { GsapFadeScrub } from "../utils/useGsap.js";
import CarouselSection from "../utils/CarouselSection.js";
import homeStyles from "../../css/homePage.module.css";

const testimonials = [
  {
    filename: "testimonial1",
  },
  {
    filename: "testimonial2",
  },
  {
    filename: "testimonial3",
  },
  {
    filename: "testimonial4",
  },
  {
    filename: "testimonial5",
  },
  {
    filename: "testimonial6",
    href: "https://www.youtube.com/watch?v=wv6gbHQyi4g&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql",
  },
  {
    filename: "testimonial7",
    href: "https://www.youtube.com/watch?v=9eyVIqOCukg&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql",
  },
  {
    filename: "testimonial8",
    href: "https://www.youtube.com/watch?v=Xe81Zg079O4&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql",
  },
  {
    filename: "testimonial9",
    href: "https://www.youtube.com/watch?v=4BdGEbkX8tA&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql",
  },
  {
    filename: "testimonial10",
    href: "https://www.youtube.com/watch?v=GHYcedw0fIU&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql",
  },
  {
    filename: "testimonial11",
    href: "https://www.youtube.com/watch?v=VF2xwJiYcWY&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql",
  },
  {
    filename: "testimonial12",
    href: "https://www.youtube.com/watch?v=m_CH_FswY8k&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql",
  },
];

export default function TestimonialsSection() {
  return (
    <GsapFadeScrub
      fadeIn
      className={`${homeStyles.mainpageContainer} ${homeStyles.carouselContainer}`}
    >
      <div className={`${homeStyles.carouselTextContainer}`}>
        <h1 className={homeStyles.mainpageCarouselTitle}>
          Real players, real stories
        </h1>
      </div>
      <CarouselSection
        className={homeStyles.mainpageCarousel}
        directory="/images/testimonials"
        filename="testimonial"
        loop
        delay={5000}
        specificFiles={testimonials}
      />
    </GsapFadeScrub>
  );
}
