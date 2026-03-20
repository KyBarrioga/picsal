"use client";

import Image from "next/image";
import { images } from "static/costants";
import { useEffect, useMemo, useState } from "react";

const sections = ["For You", "Following", "Trending"];
const imageFiles = images;
const DESKTOP_COLUMNS = 8;
const DESKTOP_ROWS = 8;
const DESKTOP_CAPACITY = DESKTOP_COLUMNS * DESKTOP_ROWS;

function formatLabelFromFilename(filename: string) {
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "");
  const withoutSource = nameWithoutExtension.replace(/-unsplash$/i, "");
  const tokens = withoutSource.split("-").filter(Boolean);
  const parts = tokens.filter((token) => !/^\d+$/.test(token));
  const artistTokens = parts.slice(0, 2);
  const titleTokens = parts.slice(2).filter((token) => !/[A-Z0-9_-]{6,}/.test(token));

  const artist = artistTokens.length > 0
    ? artistTokens.map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join(" ")
    : "Artovae Artist";

  const title = titleTokens.length > 0
    ? titleTokens.map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join(" ")
    : "Featured Artwork";

  return { artist, title };
}

const generatedGallery = imageFiles.slice(0, DESKTOP_CAPACITY).map((filename, index) => {
  const section = sections[index % sections.length];
  const { artist, title } = formatLabelFromFilename(filename);

  return {
    id: index + 1,
    title,
    artist,
    section,
    src: `/static/imgs/${filename}`,
  };
});

function getColumnCount(width) {
  if (width >= 1280) {
    return DESKTOP_COLUMNS;
  }

  if (width >= 1024) {
    return 6;
  }

  if (width >= 640) {
    return 4;
  }

  return 2;
}

function canPlace(grid, row, col, widthUnits, heightUnits, columns) {
  if (col + widthUnits > columns) {
    return false;
  }

  for (let y = row; y < row + heightUnits; y += 1) {
    for (let x = col; x < col + widthUnits; x += 1) {
      if (grid[y]?.[x]) {
        return false;
      }
    }
  }

  return true;
}

function markPlaced(grid, row, col, widthUnits, heightUnits) {
  for (let y = row; y < row + heightUnits; y += 1) {
    if (!grid[y]) {
      grid[y] = [];
    }

    for (let x = col; x < col + widthUnits; x += 1) {
      grid[y][x] = true;
    }
  }
}

function createSeededRandom(seed) {
  let value = seed >>> 0;

  return function nextRandom() {
    value += 0x6d2b79f5;
    let temp = value;
    temp = Math.imul(temp ^ (temp >>> 15), temp | 1);
    temp ^= temp + Math.imul(temp ^ (temp >>> 7), temp | 61);
    return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
  };
}

function getTargetLargeCount(maxItemCount, columns, rows, random) {
  if (columns < 4) {
    return 0;
  }

  const candidates = [];
  const maxCells = columns * rows;

  for (let largeCount = 0; largeCount <= Math.floor(maxCells / 4); largeCount += 1) {
    const requiredItems = maxCells - largeCount * 3;

    if (
      requiredItems > 0 &&
      requiredItems <= maxItemCount &&
      rows >= 3 &&
      largeCount <= (rows - 2) * Math.floor(columns / 2)
    ) {
      candidates.push(largeCount);
    }
  }

  if (candidates.length === 0) {
    return 0;
  }

  const preferred = candidates.filter((count) => count > 0 && count <= Math.max(2, Math.floor(maxItemCount / 8)));
  const pool = preferred.length > 0 ? preferred : candidates;
  return pool[Math.floor(random() * pool.length)];
}

function packGallery(items, columns, rows, seed) {
  const grid = [];
  const random = createSeededRandom(seed);
  const targetLargeCount = getTargetLargeCount(items.length, columns, rows, random);
  const requiredItems = columns * rows - targetLargeCount * 3;
  const selectedItems = items.slice(0, requiredItems);
  const largePlacements = [];
  const candidatePositions = [];

  for (let row = 0; row <= rows - 2; row += 1) {
    for (let col = 0; col <= columns - 2; col += 1) {
      candidatePositions.push({ row, col, score: random() });
    }
  }

  candidatePositions
    .sort((a, b) => b.score - a.score)
    .forEach(({ row, col }) => {
      if (largePlacements.length >= targetLargeCount) {
        return;
      }

      if (canPlace(grid, row, col, 2, 2, columns)) {
        markPlaced(grid, row, col, 2, 2);
        largePlacements.push({ row, col });
      }
    });

  const placements = [];

  largePlacements.forEach(({ row, col }) => {
    placements.push({
      row,
      col,
      widthUnits: 2,
      heightUnits: 2,
      className: "col-span-2 row-span-2",
    });
  });

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      if (!grid[row]?.[col]) {
        markPlaced(grid, row, col, 1, 1);
        placements.push({
          row,
          col,
          widthUnits: 1,
          heightUnits: 1,
          className: "",
        });
      }
    }
  }

  placements.sort((a, b) => (a.row - b.row) || (a.col - b.col));

  return selectedItems.map((item, index) => {
    const placement = placements[index];

    return {
      ...item,
      widthUnits: placement.widthUnits,
      heightUnits: placement.heightUnits,
      className: placement.className,
      image: item.src,
    };
  });
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("For You");
  const [selectedItem, setSelectedItem] = useState(null);
  const [columns, setColumns] = useState(8);
  const [rows, setRows] = useState(DESKTOP_ROWS);
  const [layoutSeed, setLayoutSeed] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const visibleItems = useMemo(() => {
    const sectionItems = generatedGallery.filter((item) => item.section === activeSection);
    const extras = generatedGallery.filter((item) => item.section !== activeSection);
    return [...sectionItems, ...extras].slice(0, DESKTOP_CAPACITY);
  }, [activeSection]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function syncColumns() {
      const nextColumns = getColumnCount(window.innerWidth);
      setColumns(nextColumns);
      setRows(nextColumns === DESKTOP_COLUMNS ? DESKTOP_ROWS : Math.ceil(DESKTOP_CAPACITY / nextColumns));

      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    }

    syncColumns();
    setLayoutSeed(Math.floor(Math.random() * 2147483647));
    window.addEventListener("resize", syncColumns);
    return () => window.removeEventListener("resize", syncColumns);
  }, []);

  const packedItems = useMemo(
    () => packGallery(visibleItems, columns, rows, layoutSeed),
    [visibleItems, columns, rows, layoutSeed]
  );

  return (
    <main className="min-h-screen">
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
      <div className="mx-auto max-w-[1920px] px-2 sm:px-3 lg:px-4">
        {/* <section className="mb-5 rounded-[32px] border border-amber-400/15 bg-gradient-to-br from-[#1a130a] via-[#0d0d0d] to-[#080808] p-6 shadow-glow sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.35em] text-amber-300/80">
                Discover visual worlds
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-stone-50 sm:text-5xl lg:text-6xl">
                A dense, gallery-first home feed with full-view artwork previews.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
                The homepage now keeps a 50+ piece grid visible, with tighter spacing and click-to-open artwork for a
                more serious ArtStation-style browsing experience.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard value="54" label="Homepage pieces" />
              <StatCard value="3" label="Feed sections" />
              <StatCard value="Full" label="Preview modal" />
            </div>
          </div>
        </section> */}

        <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* <div className="flex w-full flex-wrap items-center justify-center gap-2">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                aria-pressed={activeSection === section}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${activeSection === section
                    ? "border-amber-400/40 bg-amber-500/15 text-amber-100"
                    : "border-line bg-white/[0.03] text-stone-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
              >
                {section}
              </button>
            ))}
          </div> */}
        </section>

        <section className="grid auto-flow-dense auto-rows-[156px] grid-cols-2 gap-[2px] sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {packedItems.map((item) => (
            <article
              key={item.id}
              className={`overflow-hidden border border-line bg-panel shadow-[0_16px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-amber-400/30 ${item.className}`}
            >
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className="group flex h-full w-full flex-col text-left"
              >
                <div className="relative min-h-0 flex-1">
                  <Image
                    src={item.image}
                    alt={`${item.title} by ${item.artist}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1440px) 16vw, 12vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.015]"
                    priority={item.id <= 10}
                    // unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                  <div
                    className="
                      absolute inset-x-0 bottom-0 h-28 overflow-hidden
                    "
                  >
                    <div className="absolute inset-0 from-black/90 via-black/75 to-transparent" />
                    <div
                      className="
                        absolute inset-x-0 bottom-0
                        bg-gradient-to-t from-black via-black/80 via-black/50 to-transparent
                        transform-gpu px-4 py-3 will-change-transform
                        translate-y-5 opacity-0
                        transition-[transform,opacity] duration-300 ease-out
                        group-hover:translate-y-0 group-hover:opacity-100
                      "
                    >
                      <h2 className="line-clamp-1 text-sm font-semibold text-white sm:text-base">
                        {item.title}
                      </h2>
                      <p className="mt-1 line-clamp-1 text-xs text-stone-300 sm:text-sm">
                        {item.artist}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </section>
      </div>

      {selectedItem ? (
        <div
          className="fixed inset-0 z-30 bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedItem.title} preview`}
          onClick={() => setSelectedItem(null)}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center justify-center">
            <div
              className="grid w-full max-w-6xl gap-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#060606] lg:grid-cols-[minmax(0,1fr)_320px]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative min-h-[60vh] bg-black">
                <Image
                  src={selectedItem.image}
                  alt={`${selectedItem.title} by ${selectedItem.artist}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  unoptimized
                />
              </div>

              <aside className="flex flex-col justify-between border-t border-white/10 bg-panel px-5 py-5 lg:border-l lg:border-t-0">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-200">
                      {selectedItem.section}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <h2 className="text-2xl font-semibold text-white">{selectedItem.title}</h2>
                  <p className="mt-2 text-sm text-stone-300">by {selectedItem.artist}</p>
                  <p className="mt-5 text-sm leading-7 text-stone-400">
                    Full-view preview for the homepage MVP. This modal is ready to evolve into a real artwork detail
                    page with comments, likes, metadata, and creator actions later.
                  </p>
                </div>

                <div className="mt-6 grid gap-2 text-sm text-stone-300">
                  <div className="rounded-xl border border-white/10 px-3 py-3">
                    <div className="flex items-center justify-between">
                      <span>Format</span>
                      <span className="text-amber-200">
                        {selectedItem.widthUnits}x{selectedItem.heightUnits}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 px-3 py-3">
                    <div className="flex items-center justify-between">
                      <span>Catalog</span>
                      <span className="text-amber-200">Homepage</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <p className="text-3xl font-semibold text-amber-200">{value}</p>
      <p className="mt-2 text-sm text-stone-400">{label}</p>
    </div>
  );
}
