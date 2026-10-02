"use client";

export function Buscar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar"
      aria-label="Buscar"
      className="h-10 w-full rounded-full border border-[#b7d7ea] bg-white px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-teal"
    />
  );
}

export function matchesSearch(query: string, values: string[]) {
  const needle = normalize(query);
  if (!needle) return true;
  return normalize(values.join(" ")).includes(needle);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}
