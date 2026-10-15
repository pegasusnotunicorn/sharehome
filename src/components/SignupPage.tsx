import EmailForm from "./utils/EmailForm";
import CustomHelmet from "./utils/CustomHelmet";
import PageIntro from "./utils/PageIntro";
import usePageTitle from "./utils/usePageTitle";
import styles from "../css/pages/signupPage.module.css";

const SignupPage = () => {
  const title = "Sign up for updates";
  usePageTitle(title);

  return (
    <div className="content">
      <CustomHelmet
        title={title}
        description="Sign up to receive updates related to Love, Career & Magic."
      />

      <PageIntro
        eyebrow="Newsletter"
        title="Don’t miss a thing"
        lead="Sign up to receive updates related to Love, Career & Magic: the expansion, events and new games."
      />

      <div className={styles.card}>
        <EmailForm hideTitle isActiveAndDesktop />
      </div>
    </div>
  );
};

export default SignupPage;
