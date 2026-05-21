import * as React from "react";
import { Link } from "@tanstack/react-router";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "filled" | "outline";
};

export function Button({
  variant = "filled",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-7 h-12 text-sm tracking-wide transition-colors";
  const styles =
    variant === "filled"
      ? "bg-foreground text-background hover:bg-accent"
      : "border border-foreground text-foreground hover:bg-foreground hover:text-background";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

type LinkBtnProps = {
  to: string;
  variant?: "filled" | "outline";
  className?: string;
  children: React.ReactNode;
};

export function LinkButton({ to, variant = "filled", className = "", children }: LinkBtnProps) {
  const base =
    "inline-flex items-center justify-center px-7 h-12 text-sm tracking-wide transition-colors";
  const styles =
    variant === "filled"
      ? "bg-foreground text-background hover:bg-accent"
      : "border border-foreground text-foreground hover:bg-foreground hover:text-background";
  return (
    // @ts-expect-error — generic string path
    <Link to={to} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

export function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 h-10 text-sm border transition-colors whitespace-nowrap ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-foreground border-border hover:border-foreground"
      }`}
    >
      {children}
    </button>
  );
}
