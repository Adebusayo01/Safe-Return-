"use client";

import { useId, type InputHTMLAttributes } from "react";

import { Icon, type IconName } from "./Icon";
import styles from "./TextField.module.css";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  /** Helper text shown under the label. */
  hint?: string;
  /** Error message. When set, the field is marked invalid for assistive technology. */
  error?: string;
  /** Show "(optional)" after the label. */
  optional?: boolean;
  icon?: IconName;
}

/**
 * Labelled text input. The label is always visible (placeholders are not
 * labels), and hints and errors are linked to the input for screen readers.
 */
export function TextField({ label, hint, error, optional, icon, id, className, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {optional ? <span className={styles.optional}> (optional)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      <div className={styles.control} data-invalid={error ? "true" : undefined}>
        {icon ? <Icon name={icon} size={20} className={styles.controlIcon} /> : null}
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          <Icon name="info" size={18} className={styles.errorIcon} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
