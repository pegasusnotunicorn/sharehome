import { useState, useEffect, useRef } from "react";
import DefaultButton from "../utils/DefaultButton.js";
import PropTypes from "prop-types";

//form for mailchimp email
export const EmailForm = (props) => {
  const hideTitle = props.hideTitle;
  const isActiveAndDesktop = props.isActiveAndDesktop;
  const classFromParent = props.className;

  const emailRef = useRef(null);
  const [response, setResponse] = useState(
    props.responseOverride ??
      "Receive a coupon for a free character pin when you sign up."
  );

  //focus the email input on desktop
  useEffect(() => {
    if (isActiveAndDesktop && emailRef) {
      emailRef.current.focus();
    }
  }, [isActiveAndDesktop]);

  //submit button text depending on if navbar or main page
  const submitButtonText = "Sign up!";

  //function to submit email
  const submitEmail = (e) => {
    e.preventDefault();

    if (e.target.checkValidity()) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            email: emailRef.current.value,
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
    ? `emailWrapper ${classFromParent}`
    : "emailWrapper";

  return (
    <div className={className}>
      {!hideTitle && (
        <h1 className="formPrompt">Stay updated on the latest news.</h1>
      )}
      <p
        className="forminputText"
        dangerouslySetInnerHTML={{ __html: response }}
      ></p>
      <form
        className="formWrapper"
        autoComplete="on"
        action=""
        data-code=""
        method="post"
        target="_blank"
        onSubmit={submitEmail}
      >
        <input
          ref={emailRef}
          type="email"
          className="emailInput"
          data-inputmask=""
          name="fields[email]"
          placeholder="Enter your email"
          autoComplete="email"
          required
        />
        <DefaultButton
          animated
          shadowless
          icon="forward"
          button="submit"
          className="subscribeButton"
          text={submitButtonText}
        />
      </form>
    </div>
  );
};

EmailForm.propTypes = {
  hideTitle: PropTypes.bool,
  isActiveAndDesktop: PropTypes.bool,
  className: PropTypes.string,
  responseOverride: PropTypes.string,
};

export default EmailForm;
