import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { AdminMenu } from "@/components/admin-menu";
import { isAdmin } from "@/lib/roles";

const whatsappHref =
  "https://wa.me/5491127003907?text=Hola%20Climatech%2C%20quiero%20un%20presupuesto";
const instagramHref = "https://instagram.com/climatech.ve";

const services = [
  {
    title: "Instalación",
    text: "Colocación de equipos nuevos, con prueba de funcionamiento.",
    icon: InstallIcon,
  },
  {
    title: "Mantenimiento",
    text: "Limpieza de filtros y revisión para que el equipo rinda mejor.",
    icon: MaintainIcon,
  },
  {
    title: "Diagnóstico",
    text: "Detectamos la falla y te decimos qué hay que hacer.",
    icon: DiagnoseIcon,
  },
  {
    title: "Mudanza de equipos",
    text: "Desinstalamos, trasladamos y volvemos a dejar el equipo funcionando.",
    icon: MoveIcon,
  },
  {
    title: "Reparación",
    text: "Arreglo de fallas comunes, con atención profesional y garantizada.",
    icon: RepairIcon,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const profile = data.user ? await userProfile(supabase, data.user) : { nombre: "", rol: "" };
  const nombre = profile.nombre;
  const saludo = greeting(profile.nombre, profile.rol);
  const esAdmin = isAdmin(profile.rol);

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_#d9f6ff_0%,_#eef4ff_42%,_#f7fbff_100%)] text-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 h-80 w-80 rounded-full bg-heat/15 blur-3xl"
      />

      <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {esAdmin ? <AdminMenu /> : null}
          <a href="#inicio" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Logo />
            <span className="truncate text-lg font-semibold tracking-tight">Climatech</span>
          </a>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-navy/80 sm:flex">
          <a href="#servicios" className="hover:text-teal">
            Servicios
          </a>
          <a href="#cobertura" className="hover:text-teal">
            Cobertura
          </a>
          <a href="#contacto" className="hover:text-teal">
            Contacto
          </a>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {nombre ? (
            <div className="flex items-center gap-2">
              <a
                href="/cuenta"
                aria-label="Mi cuenta"
                className="flex items-center gap-2 text-sm font-semibold text-navy"
              >
                <PersonIcon />
                <span className="hidden max-w-[16rem] truncate sm:inline">{saludo}</span>
              </a>
              {esAdmin ? null : (
                <a
                  href="/presupuestos"
                  className="hidden rounded-full border border-[#b7e4f4] bg-white px-3 py-1 text-xs font-semibold text-navy transition hover:border-teal sm:inline"
                >
                  Ver mis presupuestos
                </a>
              )}
            </div>
          ) : (
            <a
              href="/ingresar"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-navy transition hover:text-teal sm:inline"
            >
              Ingresar
            </a>
          )}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full sm:h-auto sm:w-auto sm:bg-[#25D366] sm:px-4 sm:py-2 sm:text-sm sm:font-semibold sm:text-white sm:shadow-sm sm:transition sm:hover:bg-[#1ebe5b]"
          >
            <span className="sm:hidden">
              <WhatsappIcon />
            </span>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-5 pb-24 sm:px-8">
        <section
          id="inicio"
          className="relative overflow-hidden rounded-[2rem] border border-[#c5e6f6] bg-white/80 px-6 py-12 shadow-[0_20px_60px_rgba(11,31,107,0.08)] sm:px-12 sm:py-16"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <img
              src="/split-frio.jpg"
              alt="Equipo split de aire acondicionado"
              className="h-auto w-full max-w-xl object-contain"
            />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-teal">
              CABA y AMBA
            </p>
            <h1 className="mt-3 text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-navy sm:text-6xl">
              Servicio técnico de aires acondicionados
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium uppercase leading-8 tracking-wide text-navy/80 sm:text-xl">
              Clima perfecto, siempre.
              <br />
              Soluciones eficientes.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="/presupuesto"
                className="inline-flex h-12 items-center justify-center rounded-full bg-heat px-6 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,106,44,0.28)] transition hover:bg-[#e85a1c]"
              >
                Pedir presupuesto
              </a>
              <a
                href="#servicios"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#b7e4f4] bg-ice px-6 text-sm font-semibold text-navy transition hover:border-teal"
              >
                Ver servicios
              </a>
            </div>
          </div>
          <Wrench className="pointer-events-none absolute -bottom-6 -right-4 hidden w-44 text-[#8aa4b8] opacity-80 lg:block" />
        </section>

        <section id="servicios" className="scroll-mt-8">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-teal">
            Qué hacemos
          </h2>
          <p className="mt-2 text-center text-3xl font-bold tracking-tight">
            Cinco servicios, un mismo equipo
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-6">
            {services.map((service, index) => (
              <li
                key={service.title}
                className={`flex items-start gap-4 rounded-3xl border border-[#d4eaf6] bg-white/75 p-5 md:col-span-2 ${
                  index === 3 ? "md:col-start-2" : ""
                }`}
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e7f8fd] text-teal">
                  <service.icon />
                </span>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-navy/75">{service.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="cobertura"
          className="scroll-mt-8 flex flex-col items-center rounded-[2rem] border border-[#c5e6f6] bg-white/70 px-6 py-10 text-center"
        >
          <Pin />
          <h2 className="mt-3 text-3xl font-extrabold uppercase tracking-wide text-teal">
            CABA y AMBA
          </h2>
          <p className="mt-2 max-w-md text-navy/75">
            Trabajamos en la Ciudad de Buenos Aires y el área metropolitana.
          </p>
        </section>

        <section
          id="contacto"
          className="scroll-mt-8 rounded-[2rem] bg-navy px-6 py-10 text-white sm:px-10"
        >
          <h2 className="text-center text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
            Contáctanos para tu presupuesto
          </h2>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-bold text-navy transition hover:bg-ice"
            >
              <WhatsappIcon />
              <span>11 2700-3907</span>
            </a>
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-bold text-navy transition hover:bg-ice"
            >
              <InstagramIcon />
              <span>@climatech.ve</span>
            </a>
          </div>
          <p className="mt-8 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white/90">
            Atención profesional y garantizada
          </p>
          <p className="mt-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#7ee8f7]">
            Tu comodidad es nuestra prioridad
          </p>
        </section>
      </main>
    </div>
  );
}

async function userProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
) {
  const email = user.email?.trim().toLowerCase();
  let nombre = "";
  let rol = "";

  if (email) {
    const { data } = await supabase.from("usuarios").select("nombre, rol").eq("email", email).limit(1);
    const row = data?.[0];
    if (typeof row?.nombre === "string") nombre = row.nombre.trim();
    if (typeof row?.rol === "string") rol = row.rol.trim();
  }

  if (!nombre) {
    const meta = user.user_metadata ?? {};
    for (const value of [meta.first_name, meta.given_name, meta.full_name, meta.name]) {
      if (typeof value === "string" && value.trim()) {
        nombre = value.trim().split(/\s+/)[0] ?? value.trim();
        break;
      }
    }
  }

  if (!nombre) nombre = email?.split("@")[0] ?? "";
  return { nombre, rol };
}

function greeting(nombre: string, rol: string) {
  if (!nombre) return "";
  return rol ? `Hola ${rol}, ${nombre}` : `Hola, ${nombre}`;
}

function PersonIcon() {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-navy ring-1 ring-[#d4eef8]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none">
        <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M5.5 19.25c.7-3.3 3.15-5 6.5-5s5.8 1.7 6.5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function Logo() {
  return (
    <img
      src="/logo.jpg"
      alt=""
      className="h-12 w-12 rounded-full object-cover sm:h-16 sm:w-16"
    />
  );
}

function InstallIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
      <rect x="6" y="16" width="28" height="12" rx="3" fill="#d7f0fa" stroke="#14c8e8" strokeWidth="2" />
      <path d="M10 22h10M34 28c2 4 6 6 8 4" fill="none" stroke="#0b1f6b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="34" r="3" fill="none" stroke="#0b1f6b" strokeWidth="2" />
    </svg>
  );
}

function MaintainIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
      <rect x="8" y="10" width="16" height="22" rx="2" fill="#d7f0fa" stroke="#14c8e8" strokeWidth="2" />
      <path d="M12 16h8M12 21h8M12 26h8" stroke="#14c8e8" strokeWidth="1.6" />
      <path d="M26 30l8-14 4 2-8 14z" fill="#f4e2b0" stroke="#0b1f6b" strokeWidth="1.6" />
      <path d="M34 14c2-3 5-3 6 0" fill="none" stroke="#7ec8e6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DiagnoseIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
      <circle cx="24" cy="16" r="6" fill="#d7f0fa" stroke="#0b1f6b" strokeWidth="2" />
      <path d="M14 38c1-8 6-12 10-12s9 4 10 12" fill="#d7f0fa" stroke="#14c8e8" strokeWidth="2" />
      <circle cx="34" cy="30" r="6" fill="white" stroke="#14c8e8" strokeWidth="2" />
      <path d="M34 27v3l2 2" fill="none" stroke="#0b1f6b" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
      <rect x="6" y="20" width="22" height="12" rx="2" fill="#d7f0fa" stroke="#14c8e8" strokeWidth="2" />
      <path d="M28 24h8l4 6v2h-12" fill="#eef6fb" stroke="#0b1f6b" strokeWidth="2" />
      <circle cx="14" cy="34" r="3" fill="none" stroke="#0b1f6b" strokeWidth="2" />
      <circle cx="32" cy="34" r="3" fill="none" stroke="#0b1f6b" strokeWidth="2" />
    </svg>
  );
}

function RepairIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
      <circle cx="18" cy="22" r="6" fill="none" stroke="#14c8e8" strokeWidth="2" />
      <circle cx="30" cy="18" r="4" fill="none" stroke="#0b1f6b" strokeWidth="2" />
      <path d="M28 30l10 8" stroke="#0b1f6b" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M34 34l6-2 2 4-6 2z" fill="#d7f0fa" stroke="#14c8e8" strokeWidth="1.6" />
    </svg>
  );
}

function Pin() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 text-teal" aria-hidden>
      <path
        d="M24 6c-7 0-12 5.2-12 12.2C12 28 24 42 24 42s12-14 12-23.8C36 11.2 31 6 24 6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <circle cx="24" cy="18" r="4" fill="currentColor" />
    </svg>
  );
}

function Wrench({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <path
        d="M78 18a22 22 0 0 0-28 26L18 76a10 10 0 0 0 0 14l12 12a10 10 0 0 0 14 0l32-32a22 22 0 0 0 26-28l-16 16-12-12 16-16z"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M12.1 6.4a5.5 5.5 0 0 0-4.7 8.3L7 17.2l2.6-.4a5.5 5.5 0 1 0 2.5-10.4zm3.2 7.8c-.1.4-.8.7-1.1.7-.3.1-1.4.3-2.6-.3-1.5-.8-2.4-2.2-2.5-2.3-.1-.1-.8-1.1-.8-2.1s.5-1.5.7-1.7c.2-.2.4-.2.6-.2h.4c.1 0 .3 0 .4.3.2.5.6 1.6.6 1.7.1.1 0 .3-.1.4l-.3.4c-.1.1-.2.2-.1.4.1.2.5.8 1.1 1.3.7.6 1.3.8 1.5.9.2.1.3 0 .4-.1l.5-.6c.1-.2.3-.1.5-.1.2.1 1.3.6 1.5.7.2.1.3.2.4.3.1.2 0 .6-.1.9z"
        fill="white"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <defs>
        <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#f9ce34" />
          <stop offset="0.5" stopColor="#ee2a7b" />
          <stop offset="1" stopColor="#6228d7" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig)" />
      <rect x="6" y="6" width="12" height="12" rx="4" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="16.2" cy="7.8" r="0.8" fill="white" />
    </svg>
  );
}
