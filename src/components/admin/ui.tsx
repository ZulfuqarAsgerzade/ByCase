import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputCls =
  "w-full rounded-xl border border-brand-200 bg-white px-3.5 text-sm font-medium text-brand-900 outline-none transition placeholder:text-brand-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-brand-50 disabled:text-brand-400";

export function Card({ title, hint, children, className = "" }: { title?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-brand-100 bg-white p-5 shadow-soft sm:p-6 ${className}`}>
      {title && (
        <header className="mb-5">
          <h2 className="text-base font-extrabold text-brand-900">{title}</h2>
          {hint && <p className="mt-1 text-sm text-brand-500">{hint}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold text-brand-800">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-brand-500">{hint}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} h-11 ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} py-2.5 leading-relaxed ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} h-11 pr-8 ${props.className ?? ""}`} />;
}

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
  secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  danger: "bg-red-50 text-red-700 hover:bg-red-100",
  wa: "bg-wa text-white hover:bg-wa-dark",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: "sm" | "md" }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        size === "sm" ? "h-9 px-3.5 text-xs" : "h-11 px-5 text-sm"
      } ${variants[variant]} ${className}`}
    />
  );
}

export const linkBtn = (variant: keyof typeof variants = "secondary", size: "sm" | "md" = "md") =>
  `inline-flex items-center justify-center gap-2 rounded-xl font-bold transition ${
    size === "sm" ? "h-9 px-3.5 text-xs" : "h-11 px-5 text-sm"
  } ${variants[variant]}`;

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? "bg-brand-600" : "bg-brand-200"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

export function Notice({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-sm font-semibold ${
        kind === "error" ? "bg-red-50 text-red-700" : "bg-sage-100 text-brand-800"
      }`}
    >
      {children}
    </p>
  );
}

export function PageHeader({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-brand-600">{text}</p>}
      </div>
      {action}
    </div>
  );
}
