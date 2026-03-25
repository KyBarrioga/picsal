"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "lib/createBrowserClient";

const artwork = "/static/img/login.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const nextPath =
      typeof router.query.next === "string" && router.query.next.startsWith("/")
        ? router.query.next
        : "/user";

    await router.push(nextPath);
  }

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-canvas px-4 py-4 sm:px-6 sm:py-6 lg:px-8 ">
      <img
        src={artwork}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      />
      <div className="absolute inset-0 bg-[#020202]/70" />

      <div className="relative z-10 mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-[1600px] items-stretch overflow-hidden rounded-xl border border-line bg-[#070707] shadow-glow sm:h-[calc(100dvh-3rem)]">
        <section className="flex w-full items-center justify-center bg-[#090909] px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
          <div className="w-full max-w-[460px]">
            <h1 className="mt-4 text-4xl font-semibold text-stone-50 sm:text-5xl">
              Log in to your art space.
            </h1>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full border border-line bg-[#111111] px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400/50"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="block text-sm font-medium text-stone-200">
                    Password
                  </label>
                  <Link href="#" className="text-xs uppercase tracking-[0.2em] text-amber-300 transition hover:text-amber-200">
                    Forgot password
                  </Link>
                </div>
                <div className="flex items-center border border-line bg-[#111111] transition focus-within:border-amber-400/50">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-transparent px-4 py-3 text-sm text-stone-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="px-4 text-xs font-medium uppercase tracking-[0.2em] text-amber-300 transition hover:text-amber-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm text-stone-400">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 border border-line bg-black accent-amber-400" />
                  <span>Remember me</span>
                </label>
                <span className="text-stone-500">Secure sign-in</span>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-4 text-sm leading-7 text-rose-100">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-amber-400/35 bg-[#17120a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-amber-100 transition hover:border-amber-300/60 hover:bg-[#21180b]"
              >
                {isSubmitting ? "Signing In..." : "Log In"}
              </button>
            </form>

            <div className="mt-8 border-t border-line pt-6 text-sm text-stone-400">
              New to Picsal?{" "}
              <Link href="/signup" className="font-medium text-amber-300 transition hover:text-amber-200">
                Create an account
              </Link>
            </div>
          </div>
        </section>

        <section className="relative hidden lg:block lg:w-1/2">
          <img
            src={artwork}
            alt="Featured fantasy artwork"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/75 p-8 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Featured Artwork</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-300">
              By Community Artist
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
