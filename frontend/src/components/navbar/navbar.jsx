
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Package,
  Boxes,
  Plug,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import "./navbar.css";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Subscriptions", path: "/subscriptions", icon: CreditCard },
  { name: "Packages", path: "/packages", icon: Package },
  { name: "Services", path: "/services", icon: Boxes },
  { name: "Integrations", path: "/integrations", icon: Plug },
];

export default function Navbar({ onLogout }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const settingsRef = useRef(null);
  const navigate = useNavigate();

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    if (!onLogout) {
      console.error("Please provide the onLogout handler.");
      return;
    }

    try {
      await onLogout();
      setSettingsOpen(false);
      setMobileOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setSettingsOpen(false);
  };

  return (
    <header className="sh-navbar">
      <div className="sh-navbar-container">

        {/* Brand */}
        <NavLink
          to="/dashboard"
          className="sh-navbar-brand"
          onClick={closeMenus}
        >
          <div className="sh-brand-logo">S</div>
          <span className="sh-brand-name">
            Service<span>Hub</span>
          </span>
        </NavLink>

        {/* Mobile menu button */}
        <button
          className="sh-mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        {/* Navigation */}
        <nav className={`sh-nav-links ${mobileOpen ? "show" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenus}
                className={({ isActive }) =>
                  `sh-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} strokeWidth={1.9} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Settings dropdown */}
        <div className="sh-settings-wrapper" ref={settingsRef}>
          <button
            className={`sh-settings-button ${
              settingsOpen ? "open" : ""
            }`}
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
          >
            <Settings size={17} />
            <span>Settings</span>
            <ChevronDown
              size={15}
              className={settingsOpen ? "rotate" : ""}
            />
          </button>

          {settingsOpen && (
            <div className="sh-settings-dropdown" role="menu">
              <button
                className="sh-logout-button"
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
