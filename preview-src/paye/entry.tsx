import {createRoot} from 'react-dom/client';
import Home from './app/page';
import Header from './components/Header';
import Footer from './components/Footer';
createRoot(document.getElementById('root')!).render(<><Header/><main id="main"><Home/></main><Footer/></>);
