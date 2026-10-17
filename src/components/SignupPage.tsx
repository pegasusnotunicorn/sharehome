import EmailForm from "./utils/EmailForm";
import PageIntro from "./utils/PageIntro";
import useWindowDimensions from "./utils/useWindowDimensions";
import styles from "../css/pages/signupPage.module.css";

const SignupPage = () => {
  // (the field's focused for typing straight away on desktop; on a phone that would pop the keyboard up)
  const { isDesktop } = useWindowDimensions();

  return (
    <div className="content">
      <PageIntro
        eyebrow="Newsletter"
        title="Don’t miss a thing"
        lead="Sign up to receive updates related to Love, Career & Magic: the expansion, events and new games."
      />

      <div className={styles.card}>
        <EmailForm hideTitle isActiveAndDesktop={isDesktop} />
      </div>
    </div>
  );
};

export default SignupPage;
