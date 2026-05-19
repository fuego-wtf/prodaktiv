import { useEffect } from 'react';

/**
 * ThemeToggle — auto/dark/light icon segmented control.
 *
 * Companion to `projects/prodaktiv/index.css` token blocks. The effect
 * mirrors `brand/compound/tokens/theme-toggle.js` inline so the Vite
 * bundle ships the toggle JS without an external script tag.
 *
 * - `auto`  (monitor) removes `html[data-theme]` → OS preference applies via @media
 * - `dark`  (moon)    sets `html[data-theme="dark"]`  → explicit dark
 * - `light` (sun)     sets `html[data-theme="light"]` → explicit light
 *
 * Mounted in the top-right cluster of the page header. Storage key:
 * `prodaktiv-theme` (localStorage). Decisions log:
 * `docs/ralph-loops/2026-05-10-light-dark-mode-decisions.md`.
 */
export function ThemeToggle() {
  useEffect(() => {
    const root = document.documentElement;
    const host = document.querySelector<HTMLElement>('[data-theme-toggle]');
    if (!host) return;

    const storageKey = host.dataset.themeKey || 'prodaktiv-theme';
    const buttons = Array.from(
      host.querySelectorAll<HTMLButtonElement>('[data-theme-choice]')
    );

    function apply(mode: string | undefined) {
      const normalized = mode === 'dark' || mode === 'light' ? mode : 'auto';
      if (normalized === 'auto') {
        root.removeAttribute('data-theme');
        try { localStorage.removeItem(storageKey); } catch {}
      } else {
        root.setAttribute('data-theme', normalized);
        try { localStorage.setItem(storageKey, normalized); } catch {}
      }
      for (const btn of buttons) {
        btn.setAttribute(
          'aria-pressed',
          String(btn.dataset.themeChoice === normalized)
        );
      }
    }

    let stored = 'auto';
    try { stored = localStorage.getItem(storageKey) || 'auto'; } catch {}
    apply(stored);

    const handlers = buttons.map((btn) => {
      const handler = () => apply(btn.dataset.themeChoice);
      btn.addEventListener('click', handler);
      return { btn, handler };
    });

    return () => {
      for (const { btn, handler } of handlers) {
        btn.removeEventListener('click', handler);
      }
    };
  }, []);

  return (
    <div
      className="prodaktiv-theme-toggle"
      data-theme-toggle
      data-theme-key="prodaktiv-theme"
    >
      <button
        data-theme-choice="auto"
        aria-pressed="true"
        aria-label="Auto (follow system)"
        type="button"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="13" rx="1.5" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      </button>
      <button
        data-theme-choice="dark"
        aria-pressed="false"
        aria-label="Dark"
        type="button"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
      <button
        data-theme-choice="light"
        aria-pressed="false"
        aria-label="Light"
        type="button"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" /><path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" /><path d="M20 12h2" />
          <path d="M4.93 19.07l1.41-1.41" /><path d="M17.66 6.34l1.41-1.41" />
        </svg>
      </button>
    </div>
  );
}
