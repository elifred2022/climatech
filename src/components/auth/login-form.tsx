"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton, signInWithGoogle } from "./google-button";
import { Field } from "./field";

export function LoginForm({
  googleError = false,
  next = "/",
}: {
  googleError?: boolean;
  next?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    googleError ? "No se pudo completar el ingreso con Google." : "",
  );
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function continueWithGoogle() {
    setError("");
    setGooglePending(true);
    const authError = await signInWithGoogle(next);
    if (authError) {
      setGooglePending(false);
      setError("No se pudo abrir Google. Revisá que el proveedor esté activo en Supabase.");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setPending(false);
      const text = authError.message.toLowerCase();
      setError(
        text.includes("invalid login")
          ? "El email o la contraseña no coinciden."
          : "No se pudo iniciar sesión. Intentá de nuevo.",
      );
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <GoogleAuthButton disabled={pending || googlePending} onClick={() => void continueWithGoogle()} />

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-navy/45">
        <span className="h-px flex-1 bg-[#d3e7f3]" />
        o con tu email
        <span className="h-px flex-1 bg-[#d3e7f3]" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
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
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-navy/70">
        ¿No tenés cuenta?{" "}
        <Link
          href={next === "/" ? "/registro" : `/registro?siguiente=${next}`}
          className="font-semibold text-teal"
        >
          Registrate
        </Link>
      </p>
      </form>
    </div>
  );
}
