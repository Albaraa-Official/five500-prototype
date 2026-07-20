export const I = {
  home: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" {...p}>
      <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  grid: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  ),
  bag: (p) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" {...p}>
      <path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  ),
  user: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" {...p}>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.9" />
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  ),
  search: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  ),
  back: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" {...p}>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  heart: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <path d="M12 20s-7-4.3-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.7 12 20 12 20Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...p}>
      <path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.9 6.7 19.5l1.2-6L3.4 9.3l6-.7L12 3Z" />
    </svg>
  ),
  fire: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...p}>
      <path d="M12 3c1 3-1.5 4-1.5 6.5a3 3 0 0 0 6 0c0-.8-.2-1.5-.5-2 2 1.3 3 3.4 3 5.5a7 7 0 1 1-14 0c0-3.5 2.5-5.5 4-8 .5 1 1 1.5 3 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  location: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  bell: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" {...p}>
      <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  clock: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  apple: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...p}>
      <path d="M16.3 12.6c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .6 1 1.4 2.1 2.4 2 1-.1 1.3-.6 2.5-.6s1.5.6 2.6.6c1 0 1.7-1 2.3-2 .7-1.1 1-2.2 1-2.3-.1 0-2-.8-2-3.1ZM14.5 6.3c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.3-1.1Z" />
    </svg>
  ),
  cash: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  card: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  trash: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}>
      <path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m2 0-.7 12a1 1 0 0 1-1 1H8.7a1 1 0 0 1-1-1L7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};
