import { useEffect } from "react";
import { useLocation } from "react-router";
import PropTypes from "prop-types";

function ScrollToTop({ children }) {
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0); // A small delay ensures the scroll reset overrides the browser's behavior
  }, [location.pathname]);

  return <>{children}</>;
}

ScrollToTop.propTypes = {
  children: PropTypes.node,
};

export default ScrollToTop;
