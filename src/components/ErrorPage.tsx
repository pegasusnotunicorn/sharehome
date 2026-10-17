import { Splash } from "./utils/Splash";
import PageIntro from "./utils/PageIntro";
import DefaultButton from "./utils/DefaultButton";
import useHeadTags from "./utils/useHeadTags";
import { NOT_FOUND_META } from "../pageMeta";
import errorStyles from "../css/pages/errorPage.module.css";

// (an address with no page: titled as such, and kept out of search results)
const ErrorPage = () => {
  useHeadTags(NOT_FOUND_META);

  return (
    <div className={`content max-width ${errorStyles.errorPage}`}>
      <PageIntro
        className={errorStyles.intro}
        eyebrow="404"
        title="Not found!"
        lead="Sorry, but we couldn’t find the page you were looking for 🧭"
      >
        <DefaultButton navlink="/" variant="secondary" border="dark" icon="prev" text="Back to home" />
      </PageIntro>

      <Splash />
    </div>
  );
};

export default ErrorPage;
