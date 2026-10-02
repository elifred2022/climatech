"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="inline-flex h-12 items-center justify-center rounded-full border border-[#c5dff0] px-5 text-sm font-semibold transition hover:border-teal disabled:opacity-60"
    >
      {pending ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
