import { type ReactNode } from "react";
import styles from "../../css/utils/pageIntro.module.css";

// A page's opening, as every page has it: a small label, the page's title, a line about it, and
// anything else under it (a button, a link)
interface PageIntroProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const PageIntro = ({ title, eyebrow, lead, children, className }: PageIntroProps) => (
  <header className={`${styles.intro}${className ? ` ${className}` : ""}`}>
    {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
    <h1 className={styles.title}>{title}</h1>
    {lead && <p className={styles.lead}>{lead}</p>}
    {children && <div className={styles.actions}>{children}</div>}
  </header>
);

export default PageIntro;
