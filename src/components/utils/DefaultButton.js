import { forwardRef } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

const DefaultButton = forwardRef(
  (
    {
      id,
      className,
      text,
      navlink,
      href,
      button,
      borderedBlack,
      borderedWhite,
      inverted,
      shadowless,
      animated,
      onClick,
      style,
      icon,
      emoji,
      reversed,
      download,
    },
    ref
  ) => {
    const borderedBlackClass = borderedBlack ? "is-bordered-black" : "";
    const borderedWhiteClass = borderedWhite ? "is-bordered-white" : "";
    const invertedClass = inverted ? "is-inverted" : "";
    const shadowlessClass = shadowless ? "is-shadowless" : "";
    const reversedClass = reversed ? "is-reversed" : "";
    const animatedClass = animated ? "is-animated" : "";

    const props = {
      id: id,
      className: `defaultButton noselect ${invertedClass} ${animatedClass} ${borderedBlackClass} ${borderedWhiteClass} ${reversedClass} ${shadowlessClass} ${className}`,
      onClick: onClick,
      ref: ref,
      style: style,
    };

    const iconTextProps = {
      text: text,
      icon: icon,
      emoji: emoji,
      reversed: reversed,
    };

    //a tag, navlink, or div tag
    if (navlink) {
      props.to = navlink;
      return (
        <NavLink {...props}>
          <IconText {...iconTextProps} />
        </NavLink>
      );
    } else if (emoji) {
      props.href = `/images/emojis/${emoji}.webp`;
      props.download = `${emoji}.webp`;
      return (
        <a aria-label={text} target="_blank" rel="noreferrer" {...props}>
          <IconText {...iconTextProps} />
        </a>
      );
    } else if (href) {
      props.href = href;
      if (download) {
        props.download = download;
      }
      return (
        <a aria-label={text} target="_blank" rel="noreferrer" {...props}>
          <IconText {...iconTextProps} />
        </a>
      );
    } else if (button) {
      props.type = button;
      return (
        <button aria-label={props.text} {...props}>
          <IconText {...iconTextProps} />
        </button>
      );
    } else {
      return (
        <div {...props}>
          <IconText {...iconTextProps} />
        </div>
      );
    }
  }
);

DefaultButton.displayName = "DefaultButton";
DefaultButton.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  text: PropTypes.string,
  navlink: PropTypes.string,
  href: PropTypes.string,
  button: PropTypes.string,
  borderedBlack: PropTypes.bool,
  borderedWhite: PropTypes.bool,
  inverted: PropTypes.bool,
  shadowless: PropTypes.bool,
  animated: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  icon: PropTypes.string,
  emoji: PropTypes.string,
  reversed: PropTypes.bool,
  download: PropTypes.string,
};

const Icon = ({ icon, emoji }) => {
  if (emoji)
    return (
      <span>
        <img
          loading="lazy"
          className="defaultButtonIcon"
          src={`/images/emojis/${emoji}.webp`}
          alt="button icon"
        />
      </span>
    );
  if (icon)
    return (
      <span>
        <img
          loading="lazy"
          className="defaultButtonIcon"
          src={`/images/icons/${icon}.svg`}
          alt="button icon"
        />
      </span>
    );
  return false;
};

Icon.propTypes = {
  icon: PropTypes.string,
  emoji: PropTypes.string,
};

const IconText = ({ text, icon, emoji, reversed }) => {
  if (reversed)
    return (
      <>
        {text}
        <Icon icon={icon} emoji={emoji} />
      </>
    );
  else
    return (
      <>
        <Icon icon={icon} emoji={emoji} />
        {text}
      </>
    );
};

IconText.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.string,
  emoji: PropTypes.string,
  reversed: PropTypes.bool,
};

export default DefaultButton;
