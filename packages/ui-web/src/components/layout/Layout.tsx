import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "main" | "section";
}

export function Container({
  as: Element = "div",
  className,
  ...props
}: ContainerProps) {
  return (
    <Element {...props} className={classNames("ui-container", className)} />
  );
}

export interface PageHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({
  action,
  className,
  subtitle,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header {...props} className={classNames("ui-page-header", className)}>
      <div>
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle ? (
          <p className="ui-page-header__subtitle">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="ui-page-header__action">{action}</div> : null}
    </header>
  );
}

export type SectionLabelProps = HTMLAttributes<HTMLParagraphElement>;

export function SectionLabel({ className, ...props }: SectionLabelProps) {
  return <p {...props} className={classNames("ui-section-label", className)} />;
}

export type DividerProps = HTMLAttributes<HTMLHRElement>;

export function Divider({ className, ...props }: DividerProps) {
  return <hr {...props} className={classNames("ui-divider", className)} />;
}
