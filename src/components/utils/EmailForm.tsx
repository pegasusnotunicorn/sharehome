import { useState, useEffect, useRef, useId } from "react";
import DefaultButton from "../utils/DefaultButton";
import styles from "../../css/utils/emailForm.module.css";

interface EmailFormProps {
  hideTitle?: boolean;
  isActiveAndDesktop?: boolean;
  className?: string;
  formClassName?: string;
  titleIcon?: string;
  inputId?: string;
  responseClassName?: string;
  inputClassName?: string;
  submitButtonClassName?: string;
  compactButton?: boolean; // (a small button that keeps its own width, e.g. in the menu)
  submitButtonColor?: "dark" | "red" | "green" | "purple" | "yellow" | "white";
}

//form for mailchimp email
export const EmailForm = (props: EmailFormProps) => {
  const hideTitle = props.hideTitle;
  const isActiveAndDesktop = props.isActiveAndDesktop;
  const classFromParent = props.className;

  const emailRef = useRef<HTMLInputElement>(null);
  const fallbackId = useId();
  const inputId = props.inputId ?? fallbackId;
  // (what came back: told apart by look, and announced, success politely and a problem at once)
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  //focus the email input on desktop
  useEffect(() => {
    if (isActiveAndDesktop && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isActiveAndDesktop]);

  //submit button text depending on if navbar or main page
  const submitButtonText = "Sign up!";

  // (the browser checks the address is an email before this runs)
  const submitEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fail = (message: string) => {
      setError(message);
      setStatus("error");
    };
    setStatus("sending");

    fetch("https://assets.mailerlite.com/jsonp/248479/forms/73678789967611030/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { email: emailRef.current!.value } }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success || data.errors) fail(data.errors?.fields?.email?.[0] ?? "Something went wrong. Please try again.");
        else setStatus("done");
      })
      // (offline, or the sign-up service down: say so, rather than "Submitting..." for good)
      .catch(() => fail("Something went wrong. Please try again."));
  };

  const className = classFromParent
    ? `${styles.emailWrapper} ${classFromParent}`
    : styles.emailWrapper;

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
          <h2 className={styles.formPrompt}>
            Don’t miss the latest news.
          </h2>
        </div>
      )}
      {/* (always there, so a screen reader is listening when the thanks arrives) */}
      <p
        className={status === "done" ? `${styles.forminputText} ${styles.success} ${props.responseClassName ?? ""}` : "visually-hidden"}
        role="status"
      >
        {status === "done" ? "Thank you! You're all signed up." : ""}
      </p>
      {status === "error" && (
        <p className={`${styles.forminputText} ${styles.error} ${props.responseClassName ?? ""}`} role="alert">
          {error}
        </p>
      )}
      {/* (signed up: the form's done its job) */}
      {status !== "done" && (
        <form
          className={`${styles.formWrapper} ${props.formClassName ?? ""}`}
          autoComplete="on"
          action=""
          data-code=""
          method="post"
          target="_blank"
          onSubmit={submitEmail}
        >
          <label htmlFor={inputId} className="visually-hidden">
            Email address
          </label>
          <input
            id={inputId}
            ref={emailRef}
            type="email"
            className={`${styles.emailInput} ${props.inputClassName ?? ""}`}
            data-inputmask=""
            name="fields[email]"
            placeholder="Enter your email"
            autoComplete="email"
            required
            aria-invalid={status === "error"}
            onInput={() => status === "error" && setStatus("idle")}
          />
          <DefaultButton
            variant="primary"
            compact={props.compactButton}
            icon="forward"
            color={props.submitButtonColor ?? "dark"}
            button="submit"
            className={`${styles.subscribeButton} ${props.submitButtonClassName ?? ""}`}
            text={submitButtonText}
            loading={status === "sending"}
          />
        </form>
      )}
    </div>
  );
};

export default EmailForm;
