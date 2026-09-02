import { Brand } from "./Brand";
import { siteLinks } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer">
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
          {siteLinks.linkedin ? <a href={siteLinks.linkedin}>LinkedIn</a> : <span>LinkedIn</span>}
          <a href={`mailto:${siteLinks.email}`}>Email</a>
        </div>
      </div>
    </footer>
  );
}
