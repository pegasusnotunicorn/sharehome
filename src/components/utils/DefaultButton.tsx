import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { NavLink } from "react-router";
import styles from "../../css/utils/defaultButton.module.css";

interface DefaultButtonProps {
  text?: string;
  icon?: string;
  emoji?: string;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "ghost";
  color?: "dark" | "red" | "green" | "purple" | "yellow" | "white";
  size?: "default" | "large";
  border?: "dark" | "light" | "none";
  animated?: boolean;
  compact?: boolean;
  navlink?: string;
  href?: string;
  button?: string;
  download?: string;
  onClick?: () => void;
  id?: string;
  className?: string;
  style?: CSSProperties;
}


const colorMap: Record<string, string> = {
  dark: styles.colorDark,
  red: styles.colorRed,
  green: styles.colorGreen,
  purple: styles.colorPurple,
  yellow: styles.colorYellow,
  white: styles.colorWhite,
};

const variantMap: Record<string, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

const borderMap: Record<string, string> = {
  dark: styles.borderDark,
  light: styles.borderLight,
};

const DefaultButton = forwardRef<HTMLElement, DefaultButtonProps>(
  (
    {
      text,
      icon,
      emoji,
      iconPosition = "left",
      variant = "primary",
      color = "dark",
      size = "default",
      border,
      animated,
      compact,
      navlink,
      href,
      button,
      download,
      onClick,
      id,
      className,
      style,
    },
    ref
  ) => {
    const classes = [
      styles.btn,
      variantMap[variant],
      colorMap[color],
      size === "large" ? styles.large : "",
      border && border !== "none" ? borderMap[border] : "",
      animated ? styles.animated : "",
      iconPosition === "right" ? styles.reversed : "",
      compact ? styles.compact : "",
      className || "",
    ]
      .filter(Boolean)
      .join(" ");

    const props: Record<string, unknown> = {
      id,
      className: classes,
      onClick,
      ref,
      style,
    };

    const iconTextContent = (
      <IconText
        text={text}
        icon={icon}
        emoji={emoji}
        reversed={iconPosition === "right"}
      />
    );

    if (navlink) {
      props.to = navlink;
      return (
        <NavLink {...(props as Record<string, unknown> & { to: string })}>
          {iconTextContent}
        </NavLink>
      );
    } else if (emoji && !href) {
      props.href = `/images/emojis/${emoji}.webp`;
      props.download = `${emoji}.webp`;
      return (
        <a
          aria-label={text}
          target="_blank"
          rel="noreferrer"
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {iconTextContent}
        </a>
      );
    } else if (href) {
      props.href = href;
      if (download) {
        props.download = download;
      }
      return (
        <a
          aria-label={text}
          target="_blank"
          rel="noreferrer"
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {iconTextContent}
        </a>
      );
    } else if (button) {
      props.type = button;
      return (
        <button
          aria-label={text}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {iconTextContent}
        </button>
      );
    } else {
      return (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
          {iconTextContent}
        </div>
      );
    }
  }
);

interface IconProps {
  icon?: string;
  emoji?: string;
}

const Icon = ({ icon, emoji }: IconProps): ReactNode => {
  if (emoji)
    return (
      <span>
        <img
          loading="lazy"
          className={styles.btnIcon}
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
          className={styles.btnIcon}
          src={`/images/icons/${icon}.svg`}
          alt="button icon"
        />
      </span>
    );
  return null;
};

interface IconTextProps {
  text?: string;
  icon?: string;
  emoji?: string;
  reversed?: boolean;
}

const IconText = ({ text, icon, emoji, reversed }: IconTextProps) => {
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

export default DefaultButton;
