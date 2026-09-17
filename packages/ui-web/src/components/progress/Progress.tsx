import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
}

export function ProgressBar({
  className,
  label,
  max = 100,
  showValue = false,
  value,
  ...props
}: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(value, max));
  const percentage = max > 0 ? Math.round((normalizedValue / max) * 100) : 0;

  return (
    <div {...props} className={classNames("ui-progress", className)}>
      {label || showValue ? (
        <div className="ui-progress__header">
          <span>{label}</span>
          {showValue ? <span>{percentage}%</span> : null}
        </div>
      ) : null}
      <progress
        className="ui-progress__bar"
        value={normalizedValue}
        max={max}
        aria-label={typeof label === "string" ? label : "Progress"}
      >
        {percentage}%
      </progress>
    </div>
  );
}

export interface ProgressStepperProps extends HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  totalSteps: number;
  label?: ReactNode;
}

export function ProgressStepper({
  className,
  currentStep,
  label,
  totalSteps,
  ...props
}: ProgressStepperProps) {
  const safeTotal = Math.max(1, totalSteps);
  const safeCurrent = Math.max(1, Math.min(currentStep, safeTotal));

  return (
    <div {...props} className={classNames("ui-stepper", className)}>
      <div className="ui-stepper__header">
        <span>{label ?? `Step ${safeCurrent} of ${safeTotal}`}</span>
        <span>{Math.round((safeCurrent / safeTotal) * 100)}%</span>
      </div>
      <ProgressBar value={safeCurrent} max={safeTotal} />
      <ol className="ui-stepper__steps" aria-label="Progress steps">
        {Array.from({ length: safeTotal }, (_, index) => {
          const step = index + 1;
          return (
            <li
              key={step}
              aria-current={step === safeCurrent ? "step" : undefined}
              className={classNames(
                "ui-stepper__step",
                step <= safeCurrent && "ui-stepper__step--complete",
              )}
            >
              <span className="sr-only">Step {step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
