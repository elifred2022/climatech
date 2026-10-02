import type { ReactNode } from "react";
import Link from "next/link";

export function AuthScreen({
  title,
  subtitle,
  wide = false,
  broad = false,
  fit = false,
  children,
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  broad?: boolean;
  fit?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_#d7eef8_0%,_#eef6fb_42%,_#f7fbfe_100%)] text-navy">
      <header
        className={`mx-auto flex w-full items-center justify-between ${fit ? "px-4 py-3" : "max-w-6xl px-5 py-5 sm:px-8"}`}
      >
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Climatech
        </Link>
        <Link href="/" className="text-sm font-medium text-navy/70 hover:text-teal">
          Volver al inicio
        </Link>
      </header>
      <main
        className={`mx-auto flex w-full flex-col ${
          fit ? "px-4 pb-4" : `px-5 pb-16 sm:px-8 ${broad ? "max-w-6xl" : wide ? "max-w-2xl" : "max-w-lg"}`
        }`}
      >
        <section
          className={`border border-[#c5dff0] bg-white/85 shadow-[0_20px_60px_rgba(22,50,79,0.08)] ${
            fit ? "rounded-2xl px-3 py-3 sm:px-4" : "rounded-[2rem] px-6 py-8 sm:px-8"
          }`}
        >
          <h1 className={fit ? "text-xl font-extrabold tracking-tight" : "text-3xl font-extrabold tracking-tight"}>
            {title}
          </h1>
          {subtitle ? (
            <p className={fit ? "mt-1 text-xs leading-5 text-navy/70" : "mt-2 text-sm leading-6 text-navy/70"}>
              {subtitle}
            </p>
          ) : null}
          <div className={fit ? "mt-3" : subtitle ? "mt-6" : "mt-4"}>{children}</div>
        </section>
      </main>
    </div>
  );
}
