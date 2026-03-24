"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const artwork = "/static/img/login.jpg";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [hasConsented, setHasConsented] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleRequestAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-canvas px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
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
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
              Request beta access
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-stone-50 sm:text-5xl">
              Join Picsal early.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-stone-400">
              We are opening the platform slowly while we shape the product with a smaller testing group.
            </p>

            <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-stone-500">
              <span className={step === 1 ? "text-amber-300" : ""}>01 Consent</span>
              <span className="h-px flex-1 bg-white/10" />
              <span className={step === 2 ? "text-amber-300" : ""}>02 Request</span>
            </div>

            {step === 1 ? (
              <div className="mt-10 space-y-6">
                <div className="rounded-2xl border border-line bg-[#111111] p-6">
                  <h2 className="text-lg font-semibold text-stone-100">
                    Before you request access
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-stone-400">
                    Picsal is currently in beta. Some functions may be broken, unfinished, or still in progress, and
                    some features may take time to fully build out.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-400">
                    We are only letting in a limited number of users right now so we can test carefully, gather
                    feedback, improve the experience, and keep traffic manageable while the website grows.
                  </p>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-line bg-[#111111] px-4 py-4 text-sm text-stone-300">
                  <input
                    type="checkbox"
                    checked={hasConsented}
                    onChange={(event) => setHasConsented(event.target.checked)}
                    className="mt-1 h-4 w-4 border border-line bg-black accent-amber-400"
                  />
                  <span>
                    I understand this is a work in progress beta and I want to request early access anyway.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!hasConsented}
                  className="w-full rounded-xl border border-amber-400/35 bg-[#17120a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-amber-100 transition hover:border-amber-300/60 hover:bg-[#21180b] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[#111111] disabled:text-stone-500"
                >
                  Continue
                </button>
              </div>
            ) : (
              <form className="mt-10 space-y-5" onSubmit={handleRequestAccess}>
                <div>
                  <label htmlFor="request-email" className="mb-2 block text-sm font-medium text-stone-200">
                    Email
                  </label>
                  <input
                    id="request-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full border border-line bg-[#111111] px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl border border-amber-400/35 bg-[#17120a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-amber-100 transition hover:border-amber-300/60 hover:bg-[#21180b]"
                >
                  Request Access
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-300 transition hover:border-white/20 hover:bg-white/[0.03] hover:text-stone-100"
                >
                  Back
                </button>

                {isSubmitted ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-4 text-sm leading-7 text-amber-100">
                    Thanks. Your beta access request has been received and we will reach out if a spot opens up.
                  </div>
                ) : null}
              </form>
            )}

            <div className="mt-8 border-t border-line pt-6 text-sm text-stone-400">
              Already have access?{" "}
              <Link href="/login" className="font-medium text-amber-300 transition hover:text-amber-200">
                Log in
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
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Beta Access</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-300">
              Early members help shape the product, test new features, and guide what Picsal becomes next.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
