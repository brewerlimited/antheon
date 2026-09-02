import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: "none" | "short" | "medium";
};

export function Reveal({ children, className = "", delay = "none" }: RevealProps) {
  const delayClass =
    delay === "short" ? "reveal-delay-short" : delay === "medium" ? "reveal-delay-medium" : "";

  return <div className={`reveal ${delayClass} ${className}`}>{children}</div>;
}
