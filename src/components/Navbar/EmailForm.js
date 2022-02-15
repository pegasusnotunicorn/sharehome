import React, { useEffect } from 'react';
import MailchimpSubscribe from "react-mailchimp-subscribe";
import { useTranslation } from 'react-i18next';

import DefaultButton from '../utils/DefaultButton.js';

const url = "https://sharehomethegame.us1.list-manage.com/subscribe/post?u=492281ef78974a5a81ee73e99&amp;id=53c3e28f07";
// const url = "https://faketest.com";

//form for mailchimp email
export const EmailForm = (props) => {
  return (
    <MailchimpSubscribe
      url={url}
      render={({ subscribe, status, message }) => (
        <CustomForm
          status={status}
          message={message}
          onValidated={formData => subscribe(formData)}
          isActiveAndDesktop={props.isActiveAndDesktop}
        />
      )}
    />
  );
};

const CustomForm = ({ status, message, onValidated, isActiveAndDesktop }) => {
  const { t } = useTranslation();
  let text = t('email form.promise');
  let email;

  //function to submit to mailchimp
  const submit = () => {
    email &&
    email.value.indexOf("@") > -1 &&
    onValidated({
      EMAIL: email.value
    });
  }

  //focus the email input on desktop
  useEffect(()=>{
    if (isActiveAndDesktop && email){
      email.focus();
    }
  }, [email, isActiveAndDesktop]);

  //status text above the form
  if (status === "success"){
    text = t('email form.success');
  }
  else if (status === "error"){
    text = message.replace("0 - ", "");
  }
  else if (status === "sending"){
    text = t('email form.sending');
  }

  return (
    <div className="emailWrapper">
      <h1 className="formPrompt">{t('email form.prompt')}</h1>
      <p className="forminputText" dangerouslySetInnerHTML={{ __html: text }}></p>
      <form className="formWrapper" onSubmit={(e)=>e.preventDefault()}>
        <input
          ref={node => (email = node)}
          type="email"
          className="emailInput"
          placeholder="minasan@konbanwa.com"
          required
        />
        <DefaultButton icon="forward" onClick={submit} button="submit" className="subscribeButton" text={t('email form.button')} />
      </form>
    </div>
  )
}

export default EmailForm;
