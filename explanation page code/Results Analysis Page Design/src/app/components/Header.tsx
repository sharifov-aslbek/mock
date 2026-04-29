import { useState } from "react";
import { ChevronDown, X, Menu } from "lucide-react";

const navItems = [
  { label: "SAT" },
  { label: "ACT" },
  { label: "Matematika" },
  { label: "PSAT" },
  { label: "SHSAT" },
  { label: "Narxlar" },
  { label: "Result", active: true },
  { label: "Resurslar", hasDropdown: true },
];

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className="w-full flex items-center justify-between px-4 sm:px-6"
        style={{ backgroundColor: "#0a0a0a", height: 56, borderBottom: "1px solid #1a1a1a", position: "sticky", top: 0, zIndex: 100 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2" style={{ color: "#ffffff" }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="#fff" fillOpacity="0.9"/>
                <rect x="8" y="1" width="5" height="5" rx="1" fill="#fff" fillOpacity="0.4"/>
                <rect x="1" y="8" width="5" height="5" rx="1" fill="#fff" fillOpacity="0.4"/>
                <rect x="8" y="8" width="5" height="5" rx="1" fill="#fff" fillOpacity="0.9"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: -0.4 }}>
              MilliyMock
            </span>
          </div>
        </div>

        {/* Nav — desktop only */}
        <nav className="hidden lg:flex items-center">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-0.5 px-4 h-full transition-colors"
              style={{
                color: item.active ? "#ffffff" : "#888888",
                fontSize: 13,
                fontWeight: item.active ? 500 : 400,
                height: 56,
                borderBottom: item.active ? "2px solid #ffffff" : "2px solid transparent",
              }}
            >
              {item.label}
              {item.hasDropdown && <ChevronDown size={12} style={{ marginLeft: 2 }} />}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language switcher — hidden on small mobile */}
          <button
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded transition hover:bg-white/10"
            style={{ color: "#888", fontSize: 12 }}
          >
            UZ
            <ChevronDown size={11} />
          </button>

          {/* User button */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition hover:opacity-90"
              style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#2563eb" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </div>
              <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 500 }}>Abdurrohman</span>
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl shadow-xl py-1 z-50"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                {["Profil", "Sozlamalar"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block px-4 py-2 text-sm transition hover:bg-white/5"
                    style={{ color: "#e0e0e0", fontSize: 13 }}
                  >
                    {item}
                  </a>
                ))}
                <div style={{ borderTop: "1px solid #2a2a2a", margin: "4px 0" }} />
                <a
                  href="#"
                  className="block px-4 py-2 text-sm transition hover:bg-white/5"
                  style={{ color: "#f87171", fontSize: 13 }}
                >
                  Chiqish
                </a>
              </div>
            )}
          </div>

          {/* Avatar icon (mobile) */}
          <button
            className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#2563eb" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition hover:bg-white/10"
            style={{ color: "#aaa" }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[200]"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Drawer */}
          <div
            className="absolute top-0 right-0 h-full w-72 flex flex-col"
            style={{ backgroundColor: "#0a0a0a", borderLeft: "1px solid #1a1a1a" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #1a1a1a" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a" }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1" fill="#fff" fillOpacity="0.9"/>
                    <rect x="8" y="1" width="5" height="5" rx="1" fill="#fff" fillOpacity="0.4"/>
                    <rect x="1" y="8" width="5" height="5" rx="1" fill="#fff" fillOpacity="0.4"/>
                    <rect x="8" y="8" width="5" height="5" rx="1" fill="#fff" fillOpacity="0.9"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>MilliyMock</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-white/10"
                style={{ color: "#888" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* User info */}
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Abdurrohman</p>
                  <p style={{ color: "#666", fontSize: 11 }}>UZ</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-2 overflow-y-auto">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="flex items-center justify-between px-5 py-3 transition"
                  style={{
                    color: item.active ? "#ffffff" : "#888",
                    fontSize: 14,
                    fontWeight: item.active ? 600 : 400,
                    backgroundColor: item.active ? "#1a1a1a" : "transparent",
                    borderLeft: item.active ? "2px solid #fff" : "2px solid transparent",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && <ChevronDown size={14} style={{ color: "#555" }} />}
                </a>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="px-5 py-4" style={{ borderTop: "1px solid #1a1a1a" }}>
              <a
                href="#"
                style={{ color: "#f87171", fontSize: 13 }}
                className="block py-2"
              >
                Chiqish
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
