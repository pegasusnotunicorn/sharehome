import { useEffect } from "react";
import EmailForm from "./utils/EmailForm.js";
import CustomHelmet from "./utils/CustomHelmet.js";

const SignupPage = () => {
  const title = "Sign up for updates";

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="content max-width">
      <CustomHelmet
        title={title}
        description="Sign up to receive updates related to Love, Career & Magic."
      />

      <div className="subcontentWrapper margin-top min-width">
        <EmailForm
          hideTitle={false}
          isActiveAndDesktop
          responseOverride="Sign up to receive updates related to Love, Career & Magic."
        />
      </div>
    </div>
  );
};

export default SignupPage;
