import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Label({ children, ...props }: ComponentProps<"label">) {
  return (
    <label {...props} className="mb-1.5 block text-sm font-medium text-navy">
      {children}
    </label>
  );
}

const controlClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-navy focus:ring-2 focus:ring-navy/10";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(controlClass, className)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(controlClass, "min-h-28 resize-y", className)} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select {...props} className={cn(controlClass, "bg-white", className)} />;
}

export function FormRow({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-foreground/50">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
