"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(next: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        next === "/"
          ? `${window.location.origin}/auth/callback`
          : `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  return error;
}

export function GoogleAuthButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-[#c5dff0] bg-white text-sm font-semibold transition hover:border-teal disabled:opacity-60"
    >
      <GoogleIcon />
      Continuar con Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1 7.9-2.8l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.2-6.9-5.1H1.3v3h3.8A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.1 14.4A7.2 7.2 0 0 1 4.7 12c0-.8.1-1.6.4-2.4v-3H1.3A12 12 0 0 0 0 12c0 1.9.5 3.8 1.3 5.4l3.8-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.3 0 3.2 2.7 1.3 6.6l3.8 3C6.1 7 8.8 4.8 12 4.8z"
      />
    </svg>
  );
}
