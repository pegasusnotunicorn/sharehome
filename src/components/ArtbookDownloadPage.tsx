import DefaultButton from "./utils/DefaultButton";
import PageIntro from "./utils/PageIntro";
import usePageTitle from "./utils/usePageTitle";
import { FETCH_FIRST, srcSet } from "./utils/imageCopies";
import styles from "../css/pages/artbookPage.module.css";

// (the mockups' column: the page less its sides, up to 900px less them)
const MOCKUP_SIZES = "(max-width: 900px) calc(100vw - 2rem), 836px";

const ArtbookDownloadPage = () => {
  const title = "Digital artbook download";
  const description =
    "Thank you so much for signing up for my newsletter. Here is the free digital artbook!";
  usePageTitle(title);

  return (
    <div className="content">
      <PageIntro eyebrow="Free download" title="Your digital artbook" lead={description}>
        <DefaultButton variant="primary" icon="download" href="/Artbook%20v2.pdf" text="Download artbook" />
      </PageIntro>

      <div className={styles.mockups}>
        {/* (the first is the page's main picture: fetched first; both keep their room while they load) */}
        <img
          src="/images/artbook/mockup2.webp"
          srcSet={srcSet("/images/artbook/mockup2.webp")}
          sizes={MOCKUP_SIZES}
          width={1700}
          height={1297}
          {...FETCH_FIRST}
          alt="The digital artbook, open"
        />
        <img
          src="/images/artbook/mockup1.webp"
          srcSet={srcSet("/images/artbook/mockup1.webp")}
          sizes={MOCKUP_SIZES}
          width={1700}
          height={1015}
          alt="The digital artbook, open at the cast"
        />
      </div>

      <div className={styles.back}>
        <DefaultButton navlink="/" variant="secondary" border="dark" icon="prev" text="Back to home" />
      </div>
    </div>
  );
};

export default ArtbookDownloadPage;
