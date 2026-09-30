import { createRoot } from 'react-dom/client';
import Home from './app/page';
import { Header, Footer } from './app/site-shell';
import { SiteMotion } from './app/site-motion';
createRoot(document.getElementById('root')!).render(<><a className="skip-link" href="#main">Skip to content</a><Header/><Home/><Footer/><SiteMotion/></>);
