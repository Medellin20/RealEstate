import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center py-20">
        <div className="container-app text-center">
          <p className="text-eyebrow text-canal-600">Fout 404</p>
          <h1 className="mt-3 text-display-md font-extrabold text-ink-900 sm:text-display-lg">
            Page introuvable
          </h1>
          <p className="mx-auto mt-4 max-w-md text-ink-500">
            De woning of pagina die u zoekt bestaat niet of is niet meer beschikbaar.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4" />
                Terug naar home
              </Button>
            </Link>
            <Link href="/appartements">
              <Button>
                <Search className="h-4 w-4" />
                Voir les appartements
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
