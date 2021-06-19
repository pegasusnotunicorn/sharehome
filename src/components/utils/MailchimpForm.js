import React from 'react';
import MailchimpSubscribe from "react-mailchimp-subscribe";

//internationalization hook
import { useTranslation } from 'react-i18next';

const url = "https://sharehomethegame.us1.list-manage.com/subscribe/post?u=492281ef78974a5a81ee73e99&amp;id=53c3e28f07";

//basic email form
const EmailForm = ({ status, message, onValidated }) => {
  const { t } = useTranslation();
  let email;
  let text = t('email form.prompt');

  const submit = (e) => {
    e.preventDefault();
    onValidated({
      EMAIL: email.value
    });
  }

  //status text above the form
  if (status === "success"){
    text = message;
  }
  else if (status === "error"){
    text = message.replace("0 - ", "");
  }
  else if (status === "sending"){
    text = t('email form.sending');
  }

  return (
    <form onSubmit={submit}>
      <h3 className="forminputText" dangerouslySetInnerHTML={{__html:text}}></h3>
      <input
        ref={node => (email = node)}
        type="email"
        className="emailInput"
        placeholder="minasan@konbanwa.com"
        required
      />
      <button type="submit" className="subscribeButton button">
        {t('email form.button')}
      </button>
    </form>
  );
};

//form for mailchimp email
export const CustomForm = ({ status, message, onValidated }) => {
  return (

    <div className="emailWrapper">
      <MailchimpSubscribe
        url={url}
        render={({ subscribe, status, message }) => (
          <EmailForm
            status={status}
            message={message}
            onValidated={formData => subscribe(formData)}
          />
        )}
      />
    </div>

  );
};
