import React from "react";
import { useEffect, Fragment } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";

function ScrollToTop({ history, children }) {
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo({ top: 0 });
    });
    return () => {
      unlisten();
    };
  }, [history]);

  return <Fragment>{children}</Fragment>;
}

ScrollToTop.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default withRouter(ScrollToTop);
