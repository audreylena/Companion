"use client";

import { type ReactNode } from "react";
import {
  Check,
  Search,
  ShieldCheck,
  ShieldAlert,
  Heart,
  type LucideIcon,
} from "lucide-react";
import {
  type ToneKey,
  type SafetyLevel,
  type Category,
  toneLabel,
  toneBadgeClass,
} from "@/lib/mock";

export const cx = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/* ---------------- layout primitives ---------------- */

export function Card({
  children,
  className,
  tint,
}: {
  children: ReactNode;
  className?: string;
  tint?: boolean;
}) {
  return <div className={cx(tint ? "card-tint" : "card", className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--text)" }}>
          {title}
        </h1>
        {subtitle && <p className="text-sm mt-1 muted">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}

export function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
          {title}
        </h2>
        {hint && <p className="text-xs mt-0.5 muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function IconBubble({
  icon: Icon,
  className,
  size = 18,
}: {
  icon: LucideIcon;
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded-2xl shrink-0",
        className
      )}
      style={{ width: 40, height: 40, background: "var(--primary-soft)", color: "var(--ink-blue)" }}
    >
      <Icon size={size} />
    </span>
  );
}

/* ---------------- badges ---------------- */

export function ToneBadge({ tone }: { tone: ToneKey }) {
  return <span className={cx("badge", toneBadgeClass[tone])}>{toneLabel[tone]}</span>;
}

export function SafetyBadge({ level }: { level: SafetyLevel }) {
  if (level === "ok")
    return (
      <span className="badge badge--calm">
        <ShieldCheck size={13} /> No concerns
      </span>
    );
  if (level === "attention")
    return (
      <span className="badge badge--attention">
        <ShieldAlert size={13} /> Worth a look
      </span>
    );
  return (
    <span className="badge badge--alert">
      <ShieldAlert size={13} /> Please check in
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  if (category === "wonder")
    return <span className="badge badge--reflective">Guided to you</span>;
  if (category === "danger")
    return <span className="badge badge--alert">Escalated</span>;
  return <span className="badge badge--neutral">Comforted &amp; supported</span>;
}

/* ---------------- interactive bits ---------------- */

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx("chip", active && "chip-active")}
    >
      {children}
    </button>
  );
}

export function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled,
  className,
  icon: Icon,
}: {
  children: ReactNode;
  variant?: "primary" | "soft" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx("btn", `btn-${variant}`, className)}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="card !p-5">
      <div className="flex items-center gap-3">
        <IconBubble icon={Icon} />
        <div className="min-w-0">
          <p className="eyebrow">{label}</p>
          <p className="text-lg font-bold leading-tight mt-0.5 truncate" style={{ color: "var(--text)" }}>
            {value}
          </p>
        </div>
      </div>
      {hint && <p className="text-xs mt-3 muted">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
          {label}
        </p>
        {description && <p className="text-xs mt-0.5 muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="shrink-0 rounded-full transition-colors"
        style={{
          width: 46,
          height: 28,
          padding: 3,
          background: checked ? "var(--primary-deep)" : "#D3DEEA",
        }}
      >
        <span
          className="block rounded-full bg-white transition-transform"
          style={{ width: 22, height: 22, transform: checked ? "translateX(18px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex p-1 rounded-full" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors",
            value === o.value ? "bg-white shadow-sm" : "muted"
          )}
          style={value === o.value ? { color: "var(--ink-blue)" } : undefined}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9AA6B5" }} />
      <input
        className="field pl-11"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder ?? "Search"}
      />
    </div>
  );
}

export function EmptyState({
  emoji = "🌤️",
  title,
  note,
  action,
}: {
  emoji?: string;
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center text-center py-14">
      <div className="text-4xl mb-3" aria-hidden>{emoji}</div>
      <p className="text-base font-semibold" style={{ color: "var(--text)" }}>{title}</p>
      {note && <p className="text-sm mt-1.5 muted max-w-sm">{note}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

export function SavePill({ saved }: { saved: boolean }) {
  return (
    <span
      className={cx("badge", saved ? "badge--calm" : "badge--neutral")}
      style={{ transition: "all .2s" }}
    >
      {saved ? <Check size={13} /> : <Heart size={13} />}
      {saved ? "Saved" : "Save"}
    </span>
  );
}
