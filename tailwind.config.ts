import type { Config } from 'tailwindcss';

/**
 * Palette lives in app/globals.css as CSS custom properties.
 * Tailwind reads them through var() so there is exactly one source of truth.
 * See README.md ("Where the palette lives").
 */
/** Composes a theme colour that accepts Tailwind's /opacity modifier. */
const c = (token: string) => `rgb(var(${token}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // <alpha-value> is what lets bg-ink/15, text-bone/60 and friends work.
      // The channel triplets live in app/globals.css.
      colors: {
        bone: c('--bone-rgb'),
        paper: c('--paper-rgb'),
        ink: c('--ink-rgb'),
        saffron: c('--saffron-rgb'),
        'saffron-lift': c('--saffron-lift-rgb'),
        smoke: c('--smoke-rgb'),
        'smoke-soft': c('--smoke-soft-rgb'),
        brass: c('--brass-rgb'),
      },
      fontFamily: {
        display: 'var(--font-display)',
        deva: 'var(--font-deva)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      transitionTimingFunction: {
        // The only easing used anywhere on this site.
        ink: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      maxWidth: {
        measure: '38rem',
      },
    },
  },
  plugins: [],
};

export default config;
