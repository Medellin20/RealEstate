import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Real Estate NL — Location d’appartements aux Pays-Bas',
    template: '%s | Real Estate NL',
  },
  description:
    'Real Estate NL vous accompagne dans la recherche, la visite et la réservation d’appartements à louer aux Pays-Bas : Amsterdam, Rotterdam, Utrecht, Eindhoven, La Haye et Groningue.',
  keywords: [
    'location appartement Pays-Bas',
    'appartement Amsterdam',
    'louer Rotterdam',
    'expat housing Netherlands',
    'real estate NL',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Real Estate NL',
    title: 'Real Estate NL — Location d’appartements aux Pays-Bas',
    description:
      'Recherchez, visitez et réservez votre prochain logement aux Pays-Bas en toute confiance.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Estate NL — Location d’appartements aux Pays-Bas',
    description: 'Trouvez votre prochain logement aux Pays-Bas.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={openSans.variable}>
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
