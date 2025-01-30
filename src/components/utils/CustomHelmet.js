import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

const CustomHelmet = (props) => (
  <Helmet>
    <meta
      name="description"
      data-react-helmet="true"
      content={props.description}
    />

    <meta
      itemProp="name"
      data-react-helmet="true"
      content={props.description}
    />
    <meta
      itemProp="description"
      data-react-helmet="true"
      content={props.description}
    />
    <meta
      itemProp="image"
      data-react-helmet="true"
      content={props.splashImage}
    />

    <meta property="og:title" data-react-helmet="true" content={props.title} />
    <meta
      property="og:description"
      data-react-helmet="true"
      content={props.description}
    />
    <meta
      property="og:image"
      data-react-helmet="true"
      content={props.splashImage}
    />
    <meta
      property="og:url"
      data-react-helmet="true"
      content={window.location.href}
    />

    <meta
      name="twitter:title"
      data-react-helmet="true"
      content={props.title}
    ></meta>
    <meta
      name="twitter:description"
      data-react-helmet="true"
      content={props.description}
    />
    <meta
      name="twitter:image"
      data-react-helmet="true"
      content={props.splashImage}
    />
  </Helmet>
);

CustomHelmet.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  splashImage: PropTypes.string.isRequired,
};

export default CustomHelmet;
