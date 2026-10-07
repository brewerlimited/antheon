"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ReactElement,
} from "react";
import { useDemo } from "@/lib/recruitment/store";
import {
  initials,
  recruiters,
  statusLabels,
} from "@/lib/recruitment/catalogue";
import type { AvailabilityStatus } from "@/lib/recruitment/types";
export function Icon({
  name = "grid",
  size = 18,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, string> = {
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    people:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 7 M22 21v-2a4 4 0 0 0-3-3.87",
    briefcase: "M8 6V3h8v3 M3 6h18v14H3z M3 11c6 4 12 4 18 0 M10 12h4",
    building: "M4 21V3h11v18 M15 9h5v12 M8 7h3 M8 11h3 M8 15h3 M2 21h20",
    message: "M21 3H3v14h5l4 4 4-4h5z M7 8h10 M7 12h6",
    shield: "M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6",
    placement: "M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16 M8 14h3 M14 14h3",
    search: "M21 21l-6-6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    plus: "M12 4v16 M4 12h16",
    arrow: "M5 12h14 M13 6l6 6-6 6",
    close: "M6 6l12 12 M18 6L6 18",
    filter: "M4 6h16 M7 12h10 M10 18h4",
    chevron: "M9 5l7 7-7 7",
    down: "M5 9l7 7 7-7",
    bell: "M5 16V9a7 7 0 0 1 14 0v7l2 2H3z M10 21h4",
    settings:
      "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
    exit: "M9 3H3v18h6 M8 12h13 M16 7l5 5-5 5",
    panel: "M3 4h18v16H3z M9 4v16",
    check: "M5 12l4 4L19 6",
    clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2",
    phone: "M5 3l4 4-2 3c2 4 3 5 7 7l3-2 4 4c-3 6-11 0-15-4S0 6 5 3",
    copy: "M8 8h13v13H8z M16 8V3H3v13h5",
    dots: "M5 12h.1 M12 12h.1 M19 12h.1",
    download: "M12 3v12 M6 9l6 6 6-6 M4 16v5h16v-5",
    pin: "M12 22s8-10 8-14a8 8 0 1 0-16 0c0 4 8 14 8 14 M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
    spark: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
    play: "M8 4l12 8-12 8z",
    undo: "M8 4L3 9l5 5 M3 9h12a6 6 0 0 1 0 12",
    sort: "M8 3v18 M4 7l4-4 4 4 M16 21V3 M12 17l4 4 4-4",
    list: "M8 5h13 M8 12h13 M8 19h13 M3 5h1 M3 12h1 M3 19h1",
    board: "M3 4h5v16H3z M10 4h5v10h-5z M17 4h4v13h-4z",
    upload: "M12 16V3 M6 9l6-6 6 6 M4 16v5h16v-5",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
export function Button({
  children,
  icon,
  variant = "default",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  variant?: "default" | "primary" | "ghost" | "danger";
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      {...props}
      className={`ro-button ro-${variant} ${className}`}
    >
      {icon && <Icon name={icon} size={16} />} {children}
    </button>
  );
}
export function IconButton({
  label,
  name,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  name: string;
}) {
  return (
    <button
      type="button"
      {...props}
      className="ro-icon-button"
      title={label}
      aria-label={label}
    >
      <Icon name={name} />
    </button>
  );
}
export function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span
      className={`ro-avatar ${small ? "ro-avatar-small" : ""} ro-avatar-${name.charCodeAt(0) % 4}`}
    >
      {initials(name)}
    </span>
  );
}
export function RecruiterBadge({ id }: { id: string }) {
  const r = recruiters.find((r) => r.id === id);
  return (
    <span className={`ro-recruiter ro-${r?.colour}`} title={r?.name}>
      {r?.initials || id}
    </span>
  );
}
export function Status({
  status,
  label,
}: {
  status: AvailabilityStatus | "finishing" | "expired" | "verified";
  label?: string;
}) {
  return (
    <span className={`ro-status ro-status-${status}`}>
      <i />
      {label || statusLabels[status as AvailabilityStatus] || status}
    </span>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="ro-empty">
      <Icon name="search" size={28} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="ro-field">
      <label htmlFor={id}>{label}</label>
      {Children.map(children, (child) =>
        isValidElement(child) &&
        ["input", "select", "textarea"].includes(String(child.type))
          ? cloneElement(
              child as ReactElement<{
                id?: string;
                "aria-describedby"?: string;
              }>,
              { id, "aria-describedby": hint ? `${id}-hint` : undefined },
            )
          : child,
      )}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Combo({
  label,
  options,
  value,
  onChange,
  placeholder = "Search…",
  required = false,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <Field label={label}>
      <input
        list={id}
        value={options.find((o) => o.value === value)?.label ?? value}
        placeholder={placeholder}
        required={required}
        onChange={(e) =>
          onChange(
            options.find(
              (o) => o.label.toLowerCase() === e.target.value.toLowerCase(),
            )?.value ?? e.target.value,
          )
        }
      />
      <datalist id={id}>
        {options.map((o) => (
          <option key={o.value} value={o.label} />
        ))}
      </datalist>
    </Field>
  );
}
export function Modal({
  title,
  eyebrow,
  children,
  onClose,
  wide = false,
  drawer = false,
  footer,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  drawer?: boolean;
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    titleId = useId();
  const { state, notify, undo } = useDemo();
  useEffect(() => {
    const dialog = ref.current,
      previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("[data-initial-focus]")?.focus();
    return () => {
      dialog?.close();
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`ro-dialog ${drawer ? "ro-drawer" : ""} ${wide ? "ro-dialog-wide" : ""}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="ro-dialog-inner">
        <header className="ro-dialog-header">
          <div>
            {eyebrow && <p className="ro-eyebrow">{eyebrow}</p>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <IconButton name="close" label="Close panel" onClick={onClose} />
        </header>
        {state.notice && (
          <div
            className={`ro-dialog-feedback ${state.error ? "ro-warning" : "ro-info"}`}
            role={state.error ? "alert" : "status"}
          >
            <span>{state.notice}</span>
            <span>
              {!!state.history.length && !state.error && (
                <Button variant="ghost" onClick={undo}>
                  Undo
                </Button>
              )}
              <IconButton
                name="close"
                label="Dismiss feedback"
                onClick={() => notify("")}
              />
            </span>
          </div>
        )}
        <div className="ro-dialog-body">{children}</div>
        {footer && <footer className="ro-dialog-footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ro-tabs" role="tablist" aria-label="Section views">
      {items.map((item) => (
        <button
          type="button"
          role="tab"
          aria-selected={item === value}
          tabIndex={item === value ? 0 : -1}
          className={item === value ? "active" : ""}
          onClick={() => onChange(item)}
          onKeyDown={(e) => {
            const index = items.indexOf(item);
            const next =
              e.key === "ArrowRight"
                ? (index + 1) % items.length
                : e.key === "ArrowLeft"
                  ? (index - 1 + items.length) % items.length
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? items.length - 1
                      : -1;
            if (next >= 0) {
              e.preventDefault();
              onChange(items[next]);
              (
                e.currentTarget.parentElement?.children[
                  next
                ] as HTMLButtonElement
              )?.focus();
            }
          }}
          key={item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
export async function copyText(
  text: string,
  notify: (s: string, error?: boolean) => void,
) {
  try {
    await navigator.clipboard.writeText(text);
    notify("Copied to clipboard");
  } catch {
    notify("Clipboard unavailable. Select and copy the visible details.", true);
  }
}
export function exportCsv(filename: string, rows: string[][]) {
  const cell = (s: string) =>
    '"' + (/^[=+@-]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"';
  const blob = new Blob(
      ["\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    ),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
