'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Menu, Search, User, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/appartements', label: 'Appartements' },
  { href: '/comment-ca-marche', label: 'Comment ça marche' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 shadow-soft backdrop-blur-md'
          : 'bg-white/70 backdrop-blur-sm'
      )}
    >
      <nav className="container-app flex h-16 items-center justify-between sm:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-700 text-white">
            <Home className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">
            Real Estate <span className="text-canal-600">NL</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/mon-compte"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
          >
            <User className="h-4 w-4" />
            Mon compte
          </Link>
          <Link href="/appartements">
            <Button size="md">
              <Search className="h-4 w-4" />
              Trouver un logement
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-ink-700 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col bg-white shadow-lifted lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                <span className="text-base font-extrabold text-ink-900">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Fermer le menu"
                  className="rounded-full p-2 text-ink-400 hover:bg-sand-100 hover:text-ink-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                        pathname === link.href
                          ? 'bg-sand-100 text-ink-900'
                          : 'text-ink-600 hover:bg-sand-100'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <Link
                  href="/mon-compte"
                  className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-ink-600 hover:bg-sand-100"
                >
                  <User className="h-4.5 w-4.5" />
                  Mon compte
                </Link>
              </div>
              <div className="border-t border-ink-100 p-4">
                <Link href="/appartements" className="block">
                  <Button className="w-full" size="lg">
                    <Search className="h-4 w-4" />
                    Trouver un logement
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
