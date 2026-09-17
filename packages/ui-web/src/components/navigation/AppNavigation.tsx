import type { ReactNode } from "react";
import { classNames } from "../shared.js";

export interface NavigationItem<Key extends string = string> {
  key: Key;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  href?: string;
  disabled?: boolean;
}

interface NavigationItemViewProps<Key extends string> {
  item: NavigationItem<Key>;
  active: boolean;
  onSelect?: (key: Key) => void;
  mobile?: boolean;
}

function NavigationItemView<Key extends string>({
  active,
  item,
  mobile,
  onSelect,
}: NavigationItemViewProps<Key>) {
  const content = (
    <>
      {item.icon ? (
        <span className="ui-app-nav__icon" aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span className="ui-app-nav__label">{item.label}</span>
      {item.badge ? (
        <span className="ui-app-nav__badge">{item.badge}</span>
      ) : null}
    </>
  );
  const className = classNames(
    "ui-app-nav__item",
    mobile && "ui-app-nav__item--mobile",
    active && "ui-app-nav__item--active",
  );

  if (item.href && !item.disabled) {
    return (
      <a
        className={className}
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={() => onSelect?.(item.key)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      disabled={item.disabled}
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect?.(item.key)}
    >
      {content}
    </button>
  );
}

export interface SidebarNavProps<Key extends string = string> {
  items: ReadonlyArray<NavigationItem<Key>>;
  activeKey?: Key;
  onSelect?: (key: Key) => void;
  header?: ReactNode;
  footer?: ReactNode;
  label?: string;
  className?: string;
}

export function SidebarNav<Key extends string>({
  activeKey,
  className,
  footer,
  header,
  items,
  label = "Main navigation",
  onSelect,
}: SidebarNavProps<Key>) {
  return (
    <aside className={classNames("ui-sidebar", className)}>
      {header ? <div className="ui-sidebar__header">{header}</div> : null}
      <nav aria-label={label} className="ui-sidebar__nav">
        <ul>
          {items.map((item) => (
            <li key={item.key}>
              <NavigationItemView
                item={item}
                active={item.key === activeKey}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      </nav>
      {footer ? <div className="ui-sidebar__footer">{footer}</div> : null}
    </aside>
  );
}

export interface MobileBottomNavProps<Key extends string = string> {
  items: ReadonlyArray<NavigationItem<Key>>;
  activeKey?: Key;
  onSelect?: (key: Key) => void;
  label?: string;
  className?: string;
}

export function MobileBottomNav<Key extends string>({
  activeKey,
  className,
  items,
  label = "Mobile navigation",
  onSelect,
}: MobileBottomNavProps<Key>) {
  return (
    <nav aria-label={label} className={classNames("ui-mobile-nav", className)}>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <NavigationItemView
              item={item}
              active={item.key === activeKey}
              onSelect={onSelect}
              mobile
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
