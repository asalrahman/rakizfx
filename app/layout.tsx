import type { Metadata, Viewport } from 'next';
import './globals.css';
import './polish.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://rakizfx.com'),
  title: {
    default: 'RakizFx — Trade with momentum',
    template: '%s · RakizFx',
  },
  description:
    'Institutional-grade trading on 1,200+ instruments. Forex, indices, metals, energies, crypto and shares — from a single MetaTrader 5 account. Spreads from 0.0 pips, 28ms fills, segregated funds.',
  applicationName: 'RakizFx',
  authors: [{ name: 'Rakiz Capital Ltd' }],
  keywords: [
    'forex broker',
    'MetaTrader 5',
    'CFD trading',
    'crypto CFDs',
    'indices trading',
    'commodities',
    'tight spreads',
    'low-latency execution',
  ],
  openGraph: {
    type: 'website',
    siteName: 'RakizFx',
    title: 'RakizFx — Trade with momentum',
    description:
      'Institutional execution. Transparent pricing. The infrastructure ambitious traders need to compound their edge.',
    images: [{ url: '/assets/img-currency.jpg', width: 1200, height: 630, alt: 'RakizFx' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RakizFx — Trade with momentum',
    description: 'Spreads from 0.0 pips. 1,200+ instruments. Built for serious traders.',
    images: ['/assets/img-currency.jpg'],
  },
  icons: {
    icon: [
      { url: '/assets/favicon.svg', type: 'image/svg+xml' },
      { url: '/assets/favicon.svg', sizes: '32x32' },
      { url: '/assets/favicon.svg', sizes: '16x16' },
    ],
    apple: '/assets/favicon.svg',
    shortcut: '/assets/favicon.svg',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
