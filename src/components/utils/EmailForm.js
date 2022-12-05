import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import DefaultButton from '../utils/DefaultButton.js';

//form for mailchimp email
export const EmailForm = (props) => {
  const hideTitle = props.hideTitle;
  const isActiveAndDesktop = props.isActiveAndDesktop;
  const classFromParent = props.className;

  const { t } = useTranslation();
  let emailRef = useRef(null);
  let [response, setResponse] = useState(t('email form.promise'));

  //focus the email input on desktop
  useEffect(()=>{
    if (isActiveAndDesktop && emailRef){
      emailRef.current.focus();
    }
  }, [isActiveAndDesktop]);

  //submit button text depending on if navbar or main page
  let submitButtonText = (hideTitle) ? t('email form.joinbutton') : t('email form.button');

  //function to submit email
  let submitEmail = (e) => {
    e.preventDefault();

    if (e.target.checkValidity()){
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields:{
            email: emailRef.current.value
          }
        })
      };

      setResponse(t('email form.sending'));

      fetch('https://assets.mailerlite.com/jsonp/248479/forms/73678789967611030/subscribe', requestOptions)
      .then(response => response.json())
      .then(data => {
        if (!data.success || data.errors){
          if (data.errors.fields.email)
          setResponse(data.errors.fields.email[0]);
        }
        else {
          setResponse(t('email form.success'));
        }
      });
    }
    else {
      setResponse(t('email form.error'));
    }
  }

  return (
    <div className={`emailWrapper ${classFromParent}`}>
      { !hideTitle &&
        <h1 className="formPrompt">{t('email form.prompt')}</h1>
      }
      <p className="forminputText" dangerouslySetInnerHTML={{ __html: response }}></p>
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
        <DefaultButton animated shadowless icon="forward" button="submit" className="subscribeButton" text={submitButtonText} />
      </form>

    </div>
  )
};

export default EmailForm;
