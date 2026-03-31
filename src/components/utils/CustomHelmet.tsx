import { Helmet } from "react-helmet";

interface CustomHelmetProps {
  title: string;
  description: string;
  splashImage?: string;
}

const CustomHelmet = (props: CustomHelmetProps) => (
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
    {props.splashImage && (
      <meta
        itemProp="image"
        data-react-helmet="true"
        content={props.splashImage}
      />
    )}

    <meta property="og:title" data-react-helmet="true" content={props.title} />
    <meta
      property="og:description"
      data-react-helmet="true"
      content={props.description}
    />
    {props.splashImage && (
      <meta
        property="og:image"
        data-react-helmet="true"
        content={props.splashImage}
      />
    )}
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
    {props.splashImage && (
      <meta
        name="twitter:image"
        data-react-helmet="true"
        content={props.splashImage}
      />
    )}
  </Helmet>
);

export default CustomHelmet;
