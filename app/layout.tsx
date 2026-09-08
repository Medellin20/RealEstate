import type { Metadata, Viewport } from 'next';
import { Open_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { getSiteUrl } from '@/lib/utils/site-url';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Real Estate NL — Appartementen huren in Nederland',
    template: '%s | Real Estate NL',
  },
  description:
    'Real Estate NL begeleidt u bij het zoeken, bezichtigen en reserveren van huurappartementen in Nederland: Amsterdam, Rotterdam, Utrecht, Eindhoven, Den Haag en Groningen.',
  keywords: [
    'appartement huren Nederland',
    'appartement Amsterdam',
    'appartement huren Rotterdam',
    'huisvesting voor expats in Nederland',
    'real estate NL',
  ],
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Real Estate NL',
    title: 'Real Estate NL — Appartementen huren in Nederland',
    description:
      'Zoek, bezichtig en reserveer uw volgende woning in Nederland met vertrouwen.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Estate NL — Appartementen huren in Nederland',
    description: 'Vind uw volgende woning in Nederland.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={openSans.variable}>
      <body className="font-sans">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-open-sans)',
            },
          }}
        />
      </body>
    </html>
  );
}
