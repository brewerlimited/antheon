// Runs before paint so a returning visitor never sees a flash of the intro.
// No script or blocked storage: the website remains usable by default.
export function IntroBootstrap() {
  const development = process.env.NODE_ENV === "development";
  const source = `(function(){try{var q=new URLSearchParams(location.search);var preview=${development}&&(q.get('intro')==='replay'||q.get('intro')==='1');if(location.pathname==='/'&&(!location.hash||location.hash==='#top')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&(preview||!sessionStorage.getItem('antheon:intro:v1'))){document.documentElement.dataset.antheonIntro='pending';var timeout=setTimeout(function(){delete document.documentElement.dataset.antheonIntro},8500);document.addEventListener('antheon:intro-mounted',function(){clearTimeout(timeout)},{once:true});}}catch(e){}})();`;
  return <script id="antheon-intro-bootstrap" dangerouslySetInnerHTML={{ __html: source }} />;
}
