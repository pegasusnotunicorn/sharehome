import { useState, useEffect, useRef } from "react";
import DefaultButton from "../utils/DefaultButton";
import styles from "../../css/utils/emailForm.module.css";

interface EmailFormProps {
  hideTitle?: boolean;
  isActiveAndDesktop?: boolean;
  className?: string;
  titleIcon?: string;
  inputId?: string;
  responseOverride?: string;
  responseClassName?: string;
  inputClassName?: string;
  submitButtonClassName?: string;
  submitButtonColor?: "dark" | "red" | "green" | "purple" | "yellow" | "white";
}

//form for mailchimp email
export const EmailForm = (props: EmailFormProps) => {
  const hideTitle = props.hideTitle;
  const isActiveAndDesktop = props.isActiveAndDesktop;
  const classFromParent = props.className;

  const emailRef = useRef<HTMLInputElement>(null);
  const [response, setResponse] = useState(props.responseOverride ?? "");

  //focus the email input on desktop
  useEffect(() => {
    if (isActiveAndDesktop && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isActiveAndDesktop]);

  //submit button text depending on if navbar or main page
  const submitButtonText = "Sign up!";

  //function to submit email
  const submitEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if ((e.target as HTMLFormElement).checkValidity()) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            email: emailRef.current!.value,
          },
        }),
      };

      setResponse("Submitting...");

      fetch(
        "https://assets.mailerlite.com/jsonp/248479/forms/73678789967611030/subscribe",
        requestOptions
      )
        .then((response) => response.json())
        .then((data) => {
          if (!data.success || data.errors) {
            if (data.errors.fields.email)
              setResponse(data.errors.fields.email[0]);
          } else {
            setResponse("Thank you! You're all signed up.");
          }
        });
    } else {
      setResponse("Something went wrong. Please try again.");
    }
  };

  const className = classFromParent
    ? `${styles.emailWrapper} ${classFromParent}`
    : styles.emailWrapper;

  // Check if response contains HTML tags (for conditional rendering)
  const hasHTML = /<[a-z][\s\S]*>/i.test(response);
  const isLongDescription = props.responseOverride && response.length > 50;

  return (
    <div className={className}>
      {!hideTitle && (
        <div className={styles.formPromptWrapper}>
          {props.titleIcon && (
            <img
              loading="lazy"
              className={styles.formPromptIcon}
              src={props.titleIcon}
              alt=""
            />
          )}
          <h1 className={styles.formPrompt}>
            Stay updated
            <br />
            on the latest news.
          </h1>
        </div>
      )}
      {response && hasHTML ? (
        <p
          className={`${styles.forminputText} ${
            isLongDescription ? styles["forminputText-description"] : ""
          } ${props.responseClassName ?? ""}`}
          dangerouslySetInnerHTML={{ __html: response }}
        />
      ) : response ? (
        <p
          className={`${styles.forminputText} ${
            isLongDescription ? styles["forminputText-description"] : ""
          } ${props.responseClassName ?? ""}`}
        >
          {response}
        </p>
      ) : null}
      <form
        className={styles.formWrapper}
        autoComplete="on"
        action=""
        data-code=""
        method="post"
        target="_blank"
        onSubmit={submitEmail}
      >
        <input
          id={props.inputId}
          ref={emailRef}
          type="email"
          className={`${styles.emailInput} ${props.inputClassName ?? ""}`}
          data-inputmask=""
          name="fields[email]"
          placeholder="Enter your email"
          autoComplete="email"
          required
        />
        <DefaultButton
          variant="primary"
          compact
          icon="forward"
          color={props.submitButtonColor ?? "dark"}
          button="submit"
          className={`${styles.subscribeButton} ${props.submitButtonClassName ?? ""}`}
          text={submitButtonText}
        />
      </form>
    </div>
  );
};

export default EmailForm;
