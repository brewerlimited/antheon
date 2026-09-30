"use client";

import { useEffect, useRef, useState } from "react";

export function InteractivePreview({ slug, name }: { slug: string; name: string }) {
  const [view, setView] = useState<"wide" | "mobile">("wide");
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [status, setStatus] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.slug !== slug) return;
      if (event.data.type === "antheon-preview-ready") setReady(true);
      if (event.data.type === "antheon-preview-link-blocked") {
        setStatus("This is a design preview. External links are disabled.");
        if (statusTimer.current) clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => setStatus(""), 4500);
      }
      if (event.data.type === "antheon-preview-escape" && document.fullscreenElement === panel.current) {
        void document.exitFullscreen();
      }
    };
    const onFullscreenChange = () => {
      const expanded = document.fullscreenElement === panel.current;
      setFullScreen(expanded);
      if (!expanded) expandButton.current?.focus({ preventScroll: true });
    };
    if (expandButton.current) expandButton.current.hidden = !document.fullscreenEnabled;
    window.addEventListener("message", onMessage);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, [slug]);

  const restart = () => {
    setReady(false);
    setStatus("");
    setRevision((value) => value + 1);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === panel.current) await document.exitFullscreen();
      else await panel.current?.requestFullscreen();
    } catch {
      setStatus("Expand is unavailable here. You can still explore the preview below.");
    }
  };

  return (
    <div className="interactive-preview" ref={panel}>
      <div className="preview-toolbar">
        <div className="preview-title"><span className="preview-status-dot" aria-hidden="true" /><span>{name}</span><span className="preview-kind">Interactive homepage</span></div>
        <div className="preview-controls">
          <div className="preview-view-switch" role="group" aria-label="Preview width">
            <button type="button" onClick={() => setView("wide")} aria-pressed={view === "wide"}>Full width</button>
            <button type="button" onClick={() => setView("mobile")} aria-pressed={view === "mobile"}>Mobile</button>
          </div>
          <button type="button" className="preview-tool" onClick={restart} aria-label="Restart homepage preview"><span aria-hidden="true">↻</span> Restart</button>
          <button type="button" className="preview-tool" ref={expandButton} onClick={toggleFullscreen} aria-label={fullScreen ? "Exit full screen" : "Expand preview"}><span aria-hidden="true">⤢</span> {fullScreen ? "Exit" : "Expand"}</button>
        </div>
      </div>
      <div className={`preview-stage preview-stage-${view}`}>
        {!ready ? <div className="preview-loading" role="status">Loading the experience…</div> : null}
        <iframe key={revision} ref={frame} src={`/previews/${slug}/index.html`} title={`${name} interactive homepage preview`}
          className="preview-iframe" sandbox="allow-scripts" referrerPolicy="no-referrer" onLoad={() => setReady(true)} />
      </div>
      <div className="preview-footnote">
        <span>Scroll inside the preview. Hover, explore and try the interactions.</span>
        <span role="status" aria-live="polite">{status || "Design preview · Enquiries and external links disabled"}</span>
      </div>
    </div>
  );
}
