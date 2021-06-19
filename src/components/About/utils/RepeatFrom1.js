import React from 'react';
import { useTranslation } from 'react-i18next';

const RepeatFrom1 = () => {
  const { t } = useTranslation();

  return (
    <p>
      {t('about page.repeat.1')}
      <span className='link' onClick={()=>{window.scrollTo({top:0,behavior:'smooth'})}}>{t('about page.repeat.2')}</span>
      {t('about page.repeat.3')}
    </p>
  );
}

export default RepeatFrom1;
