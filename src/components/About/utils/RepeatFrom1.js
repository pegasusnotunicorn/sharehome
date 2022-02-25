import React from 'react';
import { useTranslation } from 'react-i18next';

const RepeatFrom1 = ({className}) => {
  const { t } = useTranslation();

  return (
    <p onClick={()=>{window.scrollTo({top:0,behavior:'smooth'})}} className={`${className} repeatFrom1`}>
      {t('about page.repeat.1')}
      <span className='link'>{t('about page.repeat.2')}</span>
      {t('about page.repeat.3')}
    </p>
  );
}

export default RepeatFrom1;
