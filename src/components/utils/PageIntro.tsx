import { type ReactNode } from "react";
import styles from "../../css/utils/pageIntro.module.css";

interface PageIntroProps {
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  minWidth?: boolean;
  className?: string;
}

const PageIntro = ({
  title,
  lead,
  children,
  minWidth = true,
  className,
}: PageIntroProps) => {
  return (
    <div className={`subcontentWrapper margin-top${minWidth ? " min-width" : ""}`}>
      <div className={`characterContent ${styles.intro}${!lead && !children ? ` ${styles.introNoSub}` : ""}${className ? ` ${className}` : ""}`}>
        <h2 className={`subtitle ${styles.title}`}>{title}</h2>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children}
      </div>
    </div>
  );
};

export default PageIntro;
