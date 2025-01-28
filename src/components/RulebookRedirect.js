import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const RulebookRedirect = () => {
  const history = useHistory();

  useEffect(() => {
    window.location.href = '/rulebook.pdf';
  }, [history]);

  return null;
};

export default RulebookRedirect;