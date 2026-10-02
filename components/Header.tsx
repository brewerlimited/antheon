"use client";

import { VectorIcon } from "@/components/VectorIcon";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Brand } from "./Brand";
import { navigation } from "@/data/site";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    const frame = window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 821px)");
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      const focusWasInMenu = menuRef.current?.contains(document.activeElement);
      setMenuOpen(false);
      if (focusWasInMenu) headerRef.current?.querySelector<HTMLAnchorElement>(".brand-link")?.focus();
    };
    desktop.addEventListener("change", onBreakpointChange);
    return () => desktop.removeEventListener("change", onBreakpointChange);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const links = Array.from(
        headerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const first = links[0];
      const last = links.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    const containFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", containFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", containFocus);
    };
  }, [menuOpen]);

  const followSection = (href: string) => {
    setMenuOpen(false);
    if (!href.startsWith("#") || (!isHome && href !== "#main-content")) return;

    window.requestAnimationFrame(() => {
      const section = document.getElementById(href.slice(1));
      const headingId = section?.getAttribute("aria-labelledby");
      const destination = (headingId ? document.getElementById(headingId) : section) ?? section;
      if (!destination) return;

      const previousTabIndex = destination.getAttribute("tabindex");
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
      destination.addEventListener(
        "blur",
        () => {
          if (previousTabIndex === null) destination.removeAttribute("tabindex");
          else destination.setAttribute("tabindex", previousTabIndex);
        },
        { once: true },
      );
    });
  };

  const sectionHref = (href: string) => href.startsWith("#") && !isHome ? `/${href}` : href;

  return (
    <>
      <a href="#main-content" className="skip-link" onClick={() => followSection("#main-content")}>
        Skip to content
      </a>
      <header ref={headerRef} className={`site-header ${isScrolled || menuOpen ? "site-header-solid" : ""}`}>
        <nav className="site-container nav-inner" aria-label="Primary navigation">
          <a href={sectionHref("#top")} className="brand-link" onClick={() => followSection("#top")}>
            <Brand />
          </a>

          <div className="desktop-nav">
            {navigation.map((item) => (
              <a key={item.href} href={sectionHref(item.href)} className="nav-link" aria-current={pathname === item.href ? "page" : undefined}>
                {item.label}
              </a>
            ))}
            <a href={sectionHref("#contact")} className="nav-cta">
              Enquire <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span>
            </a>
          </div>

          <button
            ref={menuButtonRef}
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </nav>

        <div
          ref={menuRef}
          id="mobile-navigation"
          className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}
          role="navigation"
          aria-label="Mobile navigation"
          inert={!menuOpen}
          aria-hidden={!menuOpen}
        >
          <div className="site-container mobile-menu-inner">
            {navigation.map((item) => (
              <a key={item.href} href={sectionHref(item.href)} onClick={() => followSection(item.href)}>
                {item.label}
              </a>
            ))}
            <a href={sectionHref("#contact")} className="mobile-menu-cta" onClick={() => followSection("#contact")}>
              Enquire <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span>
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
