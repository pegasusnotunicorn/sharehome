import { ChangeEvent, FocusEvent } from "react";
import styles from "../../css/utils/stepper.module.css";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "default" | "lg";
}

const Stepper = ({ value, onChange, min = 0, max = 10, size = "default" }: StepperProps) => {
  const lg = size === "lg";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") return;
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) return;
    onChange(Math.min(max, Math.max(min, parsed)));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) onChange(min);
  };

  return (
    <div className={`${styles.stepper}${lg ? ` ${styles.stepperLg}` : ""}`}>
      <button
        className={`${styles.btn}${lg ? ` ${styles.btnLg}` : ""}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        className={`${styles.count}${lg ? ` ${styles.countLg}` : ""}`}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        aria-label="Quantity"
      />
      <button
        className={`${styles.btn}${lg ? ` ${styles.btnLg}` : ""}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default Stepper;
