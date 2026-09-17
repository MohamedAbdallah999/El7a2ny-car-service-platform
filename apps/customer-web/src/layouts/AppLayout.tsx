import { Avatar } from "@car-platform/ui-web";
import { Bell, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { cartApi } from "../lib/api";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/shops", label: "Shops" },
  { to: "/parts", label: "Parts" },
  { to: "/cars", label: "My Cars" },
  { to: "/bookings", label: "Bookings" },
  { to: "/orders", label: "Orders" },
];

export function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    cartApi
      .get()
      .then(({ itemCount }) => {
        if (!cancelled) setCartCount(itemCount);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="ui-container app-header__inner">
          <button
            type="button"
            className="app-header__brand"
            onClick={() => navigate("/")}
          >
            <span className="app-header__dot" aria-hidden="true" />
            EL7A2NY
          </button>

          <nav className="app-header__nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `app-header__link${isActive ? " app-header__link--active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-header__actions">
            <button
              type="button"
              className="app-header__icon-button"
              aria-label={`Cart (${cartCount} items)`}
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 ? (
                <span className="app-header__badge">{cartCount}</span>
              ) : null}
            </button>
            <button
              type="button"
              className="app-header__icon-button"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              className="app-header__avatar"
              onClick={() => navigate("/profile")}
              aria-label="Profile"
            >
              <Avatar
                name={user ? `${user.firstName} ${user.lastName}` : "?"}
                size="sm"
              />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main ui-container">
        <Outlet />
      </main>
    </div>
  );
}
