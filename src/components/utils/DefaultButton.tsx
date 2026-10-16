import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { NavLink } from "react-router";
import styles from "../../css/utils/defaultButton.module.css";
import SiteIcon, { isIconName } from "./Icons";

interface DefaultButtonProps {
  text?: ReactNode;
  icon?: string;
  emoji?: string;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "ghost";
  color?: "dark" | "red" | "green" | "purple" | "yellow" | "white" | "kickstarter";
  size?: "default" | "large";
  border?: "dark" | "light" | "none";
  animated?: boolean;
  compact?: boolean;
  navlink?: string;
  href?: string;
  button?: string;
  download?: string;
  onClick?: () => void;
  // (greyed out and not pressable)
  disabled?: boolean;
  // (waiting on something: a spinner in place of its icon, and pressing it does nothing meanwhile)
  loading?: boolean;
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
  kickstarter: styles.colorKickstarter,
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
      disabled,
      loading,
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
      loading ? styles.loading : "",
      className || "",
    ]
      .filter(Boolean)
      .join(" ");

    const props: Record<string, unknown> = {
      id,
      className: classes,
      onClick: disabled || loading ? undefined : onClick,
      "aria-busy": loading || undefined,
      ref,
      style,
    };

    const iconTextContent = (
      <IconText
        text={text}
        icon={loading ? "spinner" : icon}
        emoji={loading ? undefined : emoji}
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
          aria-label={typeof text === "string" ? text : undefined}
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
          aria-label={typeof text === "string" ? text : undefined}
          target="_blank"
          rel="noreferrer"
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {iconTextContent}
        </a>
      );
    } else if (button) {
      // (a submit button that's loading doesn't send the form again)
      props.type = loading ? "button" : button;
      props.disabled = disabled;
      return (
        <button
          aria-label={typeof text === "string" ? text : undefined}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {iconTextContent}
        </button>
      );
    } else if (onClick || disabled) {
      // (something to press: a real button, so it can be reached and pressed from the keyboard)
      return (
        <button type="button" disabled={disabled} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
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
          alt=""
        />
      </span>
    );
  if (icon && isIconName(icon))
    return (
      <span>
        <SiteIcon name={icon} className={styles.btnIcon} strokeWidth={2.4} />
      </span>
    );
  return null;
};

interface IconTextProps {
  text?: ReactNode;
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
