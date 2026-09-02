"use client";

import { useEffect, useState } from "react";
import { Brand } from "./Brand";
import { navigation } from "@/data/site";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${isScrolled || menuOpen ? "site-header-solid" : ""}`}>
      <nav className="site-container nav-inner" aria-label="Primary navigation">
        <a href="#top" className="brand-link" onClick={closeMenu}>
          <Brand />
        </a>

        <div className="desktop-nav">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
          <a href="#contact" className="nav-cta">
            Enquire <span aria-hidden="true">↗</span>
          </a>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}>
        <div className="site-container mobile-menu-inner">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <a href="#contact" className="mobile-menu-cta" onClick={closeMenu}>
            Enquire <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
}
