import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, id, name, className, ...props }: FieldProps) {
  const inputId = id ?? name;

  return (
    <label htmlFor={inputId} className="flex flex-col gap-2 text-sm font-semibold">
      {label}
      <input
        id={inputId}
        name={name}
        className={`h-12 rounded-2xl border border-[#c5dff0] bg-ice px-4 font-normal text-navy outline-none focus:border-teal ${className ?? ""}`}
        {...props}
      />
    </label>
  );
}
