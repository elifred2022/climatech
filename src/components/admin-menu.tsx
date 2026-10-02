"use client";

import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/presupuestos", label: "Mostrar presupuestos" },
  { href: "/usuarios", label: "Mostrar usuarios" },
];

export function AdminMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#b7d7ea] bg-white text-navy transition hover:border-teal"
      >
        {open ? <CloseIcon /> : <HamburgerIcon />}
      </button>
      {open ? (
        <nav className="absolute top-12 left-0 z-20 flex w-56 flex-col rounded-2xl border border-[#c5dff0] bg-white p-2 shadow-[0_16px_40px_rgba(22,50,79,0.12)]">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-navy transition hover:bg-ice"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
