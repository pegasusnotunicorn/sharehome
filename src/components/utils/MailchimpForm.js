import React from 'react';
import MailchimpSubscribe from "react-mailchimp-subscribe";

//internationalization hook
import VisibilityTrigger from "./VisibilityTrigger.js";
import { useTranslation } from 'react-i18next';

const url = "https://sharehomethegame.us1.list-manage.com/subscribe/post?u=492281ef78974a5a81ee73e99&amp;id=53c3e28f07";
// const url = "https://faketest.com";

//basic email form
const EmailForm = ({ sidebar, status, message, onValidated, moduleStyles }) => {
  const { t } = useTranslation();
  let email;
  let text = "";

  //submit to mailchimp
  const submit = (e) => {
    e.preventDefault();
    onValidated({
      EMAIL: email.value
    });
  }

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
  else if (sidebar){
    text = t('email form.prompt');
  }
  else if (!sidebar){
    text = t('email form.promise');
  }

  const buttonText = (sidebar) ? t('email form.sidebarbutton') : t('email form.button');

  const form = (
    <form className={moduleStyles.formWrapper} onSubmit={submit}>
      <input
        ref={node => (email = node)}
        type="email"
        className={moduleStyles.emailInput}
        placeholder="minasan@konbanwa.com"
        required
      />
      <button type="submit" className={`${moduleStyles.subscribeButton} button greenBackground`}>
        { buttonText }
      </button>
    </form>
  )

  //return sidebar or animated bar for home page
  if (sidebar){
    return (
      <>
        <p className={`${moduleStyles.forminputText}`} dangerouslySetInnerHTML={{__html: text}}></p>
        { form }
      </>
    )
  }
  else {
    return (
      <>
        <VisibilityTrigger translateY>
          <h1 className={`${moduleStyles.forminputText}`}>{t('email form.prompt')}</h1>
        </VisibilityTrigger>
        <VisibilityTrigger translateY>
          { form }
        </VisibilityTrigger>
        <VisibilityTrigger translateY>
          <p className={`${moduleStyles.forminputText}`} dangerouslySetInnerHTML={{__html: text}}></p>
        </VisibilityTrigger>
      </>
    )
  }
};

//form for mailchimp email
export const CustomForm = ({ sidebar, status, message, onValidated, moduleStyles }) => {
  return (
    <div className={moduleStyles.emailWrapper}>
      <MailchimpSubscribe
        url={url}
        render={({ subscribe, status, message }) => (
          <EmailForm
            sidebar={sidebar}
            status={status}
            message={message}
            moduleStyles={moduleStyles}
            onValidated={formData => subscribe(formData)}
          />
        )}
      />
    </div>
  );
};
