import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/format";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-muted-foreground sm:mt-1 sm:text-sm">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  children,
  className,
  title,
  hint,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("atlas-card animate-rise p-4 sm:p-6", className)}>
      {title ? (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight">{title}</h2>
            {hint ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
  icon?: ReactNode;
}) {
  const toneClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : tone === "warning"
          ? "text-warning"
          : "text-foreground";

  return (
    <div className="atlas-card animate-rise group p-4 transition-transform duration-300 hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
          {label}
        </span>
        {icon ? <span className="shrink-0 text-muted-foreground">{icon}</span> : null}
      </div>
      <p className={cn("num mt-2 text-xl font-bold sm:mt-3 sm:text-[26px]", toneClass)}>
        {typeof value === "number" ? brl(value) : value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-5 py-10 text-center sm:px-6 sm:py-14">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Bar({ value, tone = "primary" }: { value: number; tone?: "primary" | "negative" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all duration-700", tone === "primary" ? "bg-primary" : "bg-negative")}
        style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }}
      />
    </div>
  );
}