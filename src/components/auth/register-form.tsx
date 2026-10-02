"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureUsuario } from "@/lib/supabase/usuarios";
import { GoogleAuthButton, signInWithGoogle } from "./google-button";
import { Field } from "./field";

export function RegisterForm({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function registerWithGoogle() {
    setError("");
    setPending(true);
    const authError = await signInWithGoogle(next);
    if (authError) {
      setPending(false);
      setError("No se pudo abrir Google. Revisá que el proveedor esté activo en Supabase.");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: nombre.trim(),
          last_name: apellido.trim(),
          phone: telefono.trim(),
          direccion: direccion.trim(),
          full_name: `${nombre.trim()} ${apellido.trim()}`,
        },
      },
    });

    if (authError) {
      setPending(false);
      setError(signupError(authError.message, authError.code));
      return;
    }

    if (data.user && data.user.identities?.length === 0) {
      setPending(false);
      setError("Ese email ya tiene una cuenta. Iniciá sesión.");
      return;
    }

    if (!data.session || !data.user) {
      setPending(false);
      setError(
        "La cuenta quedó creada, pero Supabase todavía pide confirmar el email. En Authentication desactivá Confirm email para que pueda entrar directo.",
      );
      return;
    }

    const saved = await ensureUsuario(supabase, data.user, {
      nombre,
      apellido,
      telefono,
      direccion,
    });
    if (saved.error) {
      setPending(false);
      setError("La cuenta se creó, pero no se pudo guardar en usuarios.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <GoogleAuthButton disabled={pending} onClick={() => void registerWithGoogle()} />

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-navy/45">
        <span className="h-px flex-1 bg-[#d3e7f3]" />
        o con tu email
        <span className="h-px flex-1 bg-[#d3e7f3]" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nombre"
            name="nombre"
            autoComplete="given-name"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
          <Field
            label="Apellido"
            name="apellido"
            autoComplete="family-name"
            value={apellido}
            onChange={(event) => setApellido(event.target.value)}
            required
          />
        </div>
        <Field
          label="Teléfono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          value={telefono}
          onChange={(event) => setTelefono(event.target.value)}
          required
        />
        <Field
          label="Dirección (opcional)"
          name="direccion"
          autoComplete="street-address"
          value={direccion}
          onChange={(event) => setDireccion(event.target.value)}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Field
          label="Repetir contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {error ? (
          <p className="rounded-2xl bg-[#fff1f1] px-4 py-3 text-sm text-[#9b2c2c]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white transition hover:bg-[#0f2438] disabled:opacity-60"
        >
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-navy/70">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={next === "/" ? "/ingresar" : `/ingresar?siguiente=${next}`}
          className="font-semibold text-teal"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}

function signupError(message: string, code?: string) {
  const text = message.toLowerCase();
  if (code === "email_provider_disabled" || text.includes("signups are disabled")) {
    return "El registro con email está desactivado en Supabase. En Authentication, Providers, Email, activalo.";
  }
  if (text.includes("already") || code === "user_already_exists" || code === "email_exists") {
    return "Ese email ya tiene una cuenta. Iniciá sesión.";
  }
  if (code === "email_address_invalid" || (text.includes("invalid") && text.includes("email"))) {
    return "Ese email no se puede usar. Probá con otro.";
  }
  if (code === "over_email_send_rate_limit" || text.includes("rate limit")) {
    return "Supabase está intentando mandar un correo de confirmación. En el proveedor Email desactivá Confirm email.";
  }
  if (code === "weak_password" || text.includes("at least")) {
    return "La contraseña tiene que tener al menos 6 caracteres.";
  }
  if (text.includes("password")) return "Revisá la contraseña e intentá de nuevo.";
  return "No se pudo crear la cuenta. Intentá de nuevo.";
}
