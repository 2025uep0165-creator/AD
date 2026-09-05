import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope, JetBrains_Mono, Tiro_Devanagari_Sanskrit } from 'next/font/google';
import { seo, studio } from '@/lib/content';
import './globals.css';

/**
 * next/font self-hosts these — no request to Google at runtime, no render
 * blocking, and no layout shift because the metrics are matched by the
 * fallback. Latin and Devanagari subsets only.
 *
 * There is deliberately no Inter anywhere in this project.
 */
const display = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const body = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

const deva = Tiro_Devanagari_Sanskrit({
  subsets: ['devanagari', 'latin'],
  display: 'swap',
  variable: '--font-deva',
  weight: ['400'],
});

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: {
    default: seo.title,
    template: `%s — ${studio.name}`,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: seo.siteUrl,
    siteName: studio.name,
    title: seo.title,
    description: seo.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: true, address: true },
};

export const viewport: Viewport = {
  themeColor: '#EFEAE1',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${body.variable} ${mono.variable} ${deva.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
