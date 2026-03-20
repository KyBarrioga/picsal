import Image from "next/image";
import { useMenuStore } from "store/useMenuStore";

export default function Header() {
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMenuStore();

    return (
        <header className="sticky top-0 z-20 mb-6 border border-line bg-panel/90 shadow-glow backdrop-blur xl:px-6">
        <div className="flex flex-col gap-4 px-3 py-3 sm:px-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-3 xl:gap-6">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 text-amber-200"
            >
              <Image src={"/static/logo.png"} alt="Pixhhal Logo" width={36} height={36}></Image>
              <span className="text-lg font-semibold uppercase tracking-[0.18em]">Picsal</span>
            </a>
            <nav className="hidden flex-wrap items-center gap-1 text-sm text-stone-300 xl:flex">
              {["Explore", "Feed", "Commissions"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="rounded-full px-4 py-2 transition hover:bg-white/5 hover:text-white"
                >
                  {item}
                </a>
              ))}
            </nav>
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-stone-200 transition hover:bg-white/5 xl:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </button>
          </div>

          <div className="hidden flex-1 flex-row items-center justify-end gap-3 xl:flex">
            <label className="flex min-w-[220px] items-center gap-3 rounded-full border border-line bg-black/40 px-4 py-3 text-sm text-stone-400 sm:min-w-[320px]">
              <span className="text-amber-300">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search illustrations, concept art, artists..."
                className="w-full bg-transparent outline-none placeholder:text-stone-500"
              />
            </label>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button className="rounded-full px-4 py-2 text-sm font-medium text-stone-200 transition hover:bg-white/5">
                Log in
              </button>
              <select
                defaultValue="EN"
                className="rounded-full border border-line bg-panelAlt px-4 py-2 text-sm text-stone-100 outline-none transition hover:border-amber-400/40"
                aria-label="Language"
              >
                <option value="EN">EN</option>
                <option value="JP">JP</option>
                <option value="CN">CN</option>
                </select>
              </div>
            </div>

          {isMobileMenuOpen ? (
            <div className="grid gap-3 border-t border-white/10 pt-3 xl:hidden">
              <label className="flex items-center gap-3 rounded-full border border-line bg-black/40 px-4 py-3 text-sm text-stone-400">
                <span className="text-amber-300">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search illustrations, concept art, artists..."
                  className="w-full bg-transparent outline-none placeholder:text-stone-500"
                />
              </label>

              <nav className="grid gap-2 text-sm text-stone-300">
                {["Explore", "Feed", "Commissions"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <div className="flex items-center justify-between gap-3">
                <button className="rounded-full px-4 py-2 text-sm font-medium text-stone-200 transition hover:bg-white/5">
                  Log in
                </button>
                <select
                  defaultValue="EN"
                  className="rounded-full border border-line bg-panelAlt px-4 py-2 text-sm text-stone-100 outline-none transition hover:border-amber-400/40"
                  aria-label="Language"
                >
                  <option value="EN">EN</option>
                  <option value="JP">JP</option>
                  <option value="CN">CN</option>
                </select>
              </div>
            </div>
          ) : null}
        </div>
      </header>
    )
}
