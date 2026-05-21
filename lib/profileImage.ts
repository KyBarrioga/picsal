export const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#23160a" />
          <stop offset="100%" stop-color="#0b0b0b" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#avatarBg)" />
      <circle cx="80" cy="62" r="28" fill="#f6e7bf" />
      <path d="M32 138c9-24 28-38 48-38s39 14 48 38" fill="#f6e7bf" />
      <circle cx="80" cy="80" r="76" fill="none" stroke="#d4a017" stroke-width="4" />
    </svg>
  `);
