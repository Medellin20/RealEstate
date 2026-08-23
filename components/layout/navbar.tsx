'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  CircleHelp,
  Home,
  Info,
  Mail,
  Menu,
  MoreHorizontal,
  Search,
  User,
  Workflow,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { LanguageTranslator } from '@/components/layout/language-translator';

const NAV_LINKS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/appartements', label: 'Appartements', icon: Building2 },
  { href: '/comment-ca-marche', label: 'Comment ça marche', icon: Workflow },
  { href: '/a-propos', label: 'À propos', icon: Info },
  { href: '/contact', label: 'Contact', icon: Mail },
];

const TABLET_LINKS = NAV_LINKS.slice(1, 4);

function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [tabletOpen, setTabletOpen] = React.useState(false);
  const tabletMenuRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setTabletOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setMobileOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (!tabletOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!tabletMenuRef.current?.contains(event.target as Node)) setTabletOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setTabletOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [tabletOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 shadow-soft backdrop-blur-md'
          : 'bg-white/70 backdrop-blur-sm'
      )}
    >
      <nav className="container-app flex h-16 items-center justify-between md:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-700 text-white">
            <Home className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-ink-900 min-[390px]:inline">
            Real Estate <span className="text-canal-600">NL</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageTranslator id="desktop-language-translator" />
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
          <div ref={tabletMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setTabletOpen((open) => !open)}
              aria-expanded={tabletOpen}
              aria-controls="main-dropdown-menu"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-700 hover:bg-sand-100"
            >
              <Menu className="h-4.5 w-4.5" /> Menu
            </button>
            <AnimatePresence>
              {tabletOpen && (
                <motion.div id="main-dropdown-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-ink-100 bg-white p-2 shadow-lifted">
                  {NAV_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-sand-100', isActivePath(pathname, link.href) ? 'bg-sand-100 text-ink-900' : 'text-ink-600')}>
                      <link.icon className="h-4.5 w-4.5 text-canal-600" /> {link.label}
                    </Link>
                  ))}
                  <Link href="/faq" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-sand-100"><CircleHelp className="h-4.5 w-4.5 text-canal-600" /> Questions fréquentes</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation tablette : accès directs essentiels et menu secondaire compact. */}
        <div className="hidden">
          {TABLET_LINKS.map((link) => {
            const isActive = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-2.5 py-2 text-sm font-medium transition-colors lg:px-3',
                  isActive ? 'bg-sand-100 text-ink-900' : 'text-ink-500 hover:bg-sand-100 hover:text-ink-900'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/mon-compte"
            aria-label="Mon compte"
            className={cn(
              'rounded-lg p-2.5 text-ink-500 transition-colors hover:bg-sand-100 hover:text-ink-900',
              pathname === '/mon-compte' && 'bg-sand-100 text-ink-900'
            )}
          >
            <User className="h-5 w-5" />
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setTabletOpen((open) => !open)}
              aria-expanded={tabletOpen}
              aria-controls="tablet-more-menu"
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-600 hover:bg-sand-100"
            >
              <MoreHorizontal className="h-5 w-5" />
              Plus
            </button>
            <AnimatePresence>
              {tabletOpen && (
                <motion.div
                  id="tablet-more-menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-ink-100 bg-white p-2 shadow-lifted"
                >
                  <Link href="/contact" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-600 hover:bg-sand-100">
                    <Mail className="h-4 w-4" /> Contact
                  </Link>
                  <Link href="/faq" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-600 hover:bg-sand-100">
                    <CircleHelp className="h-4 w-4" /> Questions fréquentes
                  </Link>
                  <div className="mt-1 border-t border-ink-100 px-3 pt-2">
                    <LanguageTranslator id="tablet-language-translator" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-ink-700 hover:bg-sand-100 md:hidden"
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
              className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation principale"
              className="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col bg-white shadow-lifted md:hidden"
            >
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                <span className="flex items-center gap-2 text-base font-extrabold text-ink-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-700 text-white"><Home className="h-4 w-4" /></span>
                  Menu principal
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Fermer le menu"
                  className="rounded-full p-2 text-ink-400 hover:bg-sand-100 hover:text-ink-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                <LanguageTranslator id="mobile-language-translator" className="mb-3 w-fit" />
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
                      className={cn(
                        'flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors',
                        isActivePath(pathname, link.href)
                          ? 'bg-sand-100 text-ink-900'
                          : 'text-ink-600 hover:bg-sand-100'
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <Link
                  href="/faq"
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-ink-600 hover:bg-sand-100"
                >
                  <CircleHelp className="h-5 w-5" />
                  Questions fréquentes
                </Link>
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
