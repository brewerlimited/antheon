import { Brand } from "./Brand";
import { siteLinks } from "@/data/site";
import { serviceNavigation } from "@/data/public-content";
import styles from "@/components/public-content/footer-links.module.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <nav className={`site-container ${styles.links}`} aria-label="Services and contact">{serviceNavigation.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <div className="site-container footer-grid">
        <div>
          <Brand compact />
          <p>Independent venture &amp; digital development group.</p>
        </div>
        <div className="footer-meta">
          <span>© 2026 Anthēon Group</span>
          <span>Buckinghamshire, United Kingdom</span>
        </div>
        <div className="footer-links">
          <a href="/privacy">Privacy</a>
          {siteLinks.linkedin ? <a href={siteLinks.linkedin}>LinkedIn</a> : null}
          <a href={`mailto:${siteLinks.email}`}>Email</a>
        </div>
      </div>
    </footer>
  );
}
