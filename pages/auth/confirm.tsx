"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createClient } from "lib/createBrowserClient";

const artwork = "/static/img/login.jpg";

function getNextPath(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/user";
  }

  return value;
}

export default function AuthConfirmPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const nextPath = getNextPath(router.query.next);
    const tokenHash = typeof router.query.token_hash === "string" ? router.query.token_hash : "";
    const type = typeof router.query.type === "string" ? router.query.type : "email";

    let isActive = true;

    async function confirmAuth() {
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "email" | "recovery" | "invite" | "email_change" | "magiclink",
        });

        if (!isActive) {
          return;
        }

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        setStatus("success");
        setMessage("Email confirmed. Redirecting you now...");
        await router.replace(nextPath);
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!isActive) {
          return;
        }

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        setStatus("success");
        setMessage("Email confirmed. Redirecting you now...");
        await router.replace(nextPath);
        return;
      }

      setStatus("error");
      setMessage("This confirmation link is invalid or has expired.");
    }

    void confirmAuth();

    return () => {
      isActive = false;
    };
  }, [router, supabase]);

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-canvas">
      {/* <img
        src={artwork}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      />
      <div className="absolute inset-0 bg-[#020202]/70" /> */}

      <div className="relative z-10 flex min-h-[calc(100dvh-2rem)] w-full items-center justify-center overflow-hidden ">
        <section className="w-full max-w-[520px] px-6 py-10 text-center sm:px-10">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
            Account confirmation
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-stone-50 sm:text-5xl">
            {status === "error" ? "We could not confirm your email." : "Finishing your signup."}
          </h1>
          <p className="mt-6 text-sm leading-7 text-stone-300">
            {message}
          </p>

          {status === "loading" ? (
            <div className="mt-8 text-xs uppercase tracking-[0.24em] text-stone-500">
              Please wait
            </div>
          ) : null}

          {status === "error" ? (
            <div className="mt-8 space-y-4">
              <Link
                href="/signup"
                className="inline-flex rounded-xl border border-amber-400/35 bg-[#17120a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-amber-100 transition hover:border-amber-300/60 hover:bg-[#21180b]"
              >
                Back to signup
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
