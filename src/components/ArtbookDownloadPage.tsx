import CustomHelmet from "./utils/CustomHelmet";
import DefaultButton from "./utils/DefaultButton";
import PageIntro from "./utils/PageIntro";
import usePageTitle from "./utils/usePageTitle";
import styles from "../css/pages/artbookPage.module.css";

const ArtbookDownloadPage = () => {
  //custom meta tags for this page
  const title = "Digital artbook download";
  const splashImage = "https://lovecareermagic.com/images/artbook/mockup2.webp";
  const description =
    "Thank you so much for signing up for my newsletter. Here is the free digital artbook!";
  usePageTitle(title);

  return (
    <div className="content">
      <CustomHelmet title={title} splashImage={splashImage} description={description} />

      <PageIntro eyebrow="Free download" title="Your digital artbook" lead={description}>
        <DefaultButton variant="primary" icon="download" href="/Artbook%20v2.pdf" text="Download artbook" />
      </PageIntro>

      <div className={styles.mockups}>
        <img loading="lazy" src="/images/artbook/mockup2.webp" alt="The digital artbook, open" />
        <img loading="lazy" src="/images/artbook/mockup1.webp" alt="The digital artbook, open at the cast" />
      </div>

      <div className={styles.back}>
        <DefaultButton navlink="/" variant="secondary" border="dark" icon="prev" text="Back to home" />
      </div>
    </div>
  );
};

export default ArtbookDownloadPage;
