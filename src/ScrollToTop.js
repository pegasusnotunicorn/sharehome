import { useEffect } from "react";
import { useLocation } from "react-router";
import PropTypes from "prop-types";

function ScrollToTop({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location.pathname]);

  return <>{children}</>;
}

ScrollToTop.propTypes = {
  children: PropTypes.node,
};

export default ScrollToTop;
