import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, KeyRound, CalendarCheck, Building2, Quote, Star, MapPin } from 'lucide-react';
import { HeroSearchBar } from '@/components/properties/hero-search-bar';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { getCityPropertySummaries } from '@/lib/data/properties';
import { formatPrice } from '@/lib/utils/format';
import { DUTCH_CITIES } from '@/lib/utils/constants';
import { DUTCH_TESTIMONIALS } from '@/lib/data/testimonials';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Real Estate NL — Appartementen huren in Nederland',
  description:
    'Vind uw volgende woning in Nederland. Real Estate NL maakt het zoeken, bezichtigen en reserveren van appartementen in Amsterdam, Rotterdam, Utrecht en daarbuiten eenvoudig.',
};

const STEPS = [
  {
    icon: Building2,
    title: 'Zoek een woning',
    description: 'Filter op stad, budget en aantal slaapkamers uit onze geverifieerde advertenties.',
  },
  {
    icon: CalendarCheck,
    title: 'Plan een bezichtiging',
    description: 'Kies een datum en tijdstip en verstuur uw aanvraag gratis naar het agentschap.',
  },
  {
    icon: ShieldCheck,
    title: 'Verstuur uw reservering',
    description: 'Deel uw huurplannen; ons team beoordeelt daarna uw dossier.',
  },
  {
    icon: KeyRound,
    title: 'Verhuis',
    description: 'Na goedkeuring van uw dossier ontvangt u de sleutels van uw nieuwe woning.',
  },
];

const TRUST_POINTS = [
  { value: '6', label: 'steden in Nederland' },
  { value: '100%', label: 'geverifieerde advertenties van het agentschap' },
  { value: '48h', label: 'gemiddelde reactietermijn op een aanvraag' },
];

export default async function HomePage() {
  const citySummaries = await getCityPropertySummaries();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="container-app relative pb-16 pt-20 sm:pb-24 sm:pt-28 lg:pt-32">
          <div>
            <span className="text-eyebrow inline-block rounded-full bg-white/10 px-3 py-1.5 uppercase text-sand-200">
              Gespecialiseerd agentschap — Nederland
            </span>
            <h1 className="mt-5 max-w-2xl text-display-md font-extrabold text-white sm:text-display-lg">
              Vind uw volgende woning in Nederland
            </h1>
            <p className="mt-4 max-w-xl text-base text-sand-200 sm:text-lg">
              Real Estate NL maakt het zoeken, bezichtigen en reserveren van appartementen eenvoudig
              in Nederland — met duidelijke, veilige begeleiding zonder verrassingen.
            </p>
          </div>

          <FadeIn delay={0.15} className="mt-8 max-w-4xl">
            <HeroSearchBar />
          </FadeIn>

          <FadeIn delay={0.25} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sand-300">
            <span>Populaire steden:</span>
            {DUTCH_CITIES.map((city) => (
              <Link
                key={city}
                href={`/appartements?city=${encodeURIComponent(city)}`}
                className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
              >
                {city}
              </Link>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* CHIFFRES DE CONFIANCE */}
      <section className="border-b border-ink-100 bg-white py-8">
        <div className="container-app grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.label} className="flex items-center gap-4">
              <span className="text-3xl font-extrabold text-ink-900">{point.value}</span>
              <span className="text-sm text-ink-500">{point.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* APPARTEMENTS CLASSÉS PAR VILLE */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Nederland"
                title="Populaire steden"
                description="Kies een stad om alle beschikbare appartementen te bekijken."
              />
              <Link href="/appartements">
                <Button variant="outline">
                  Alle appartementen bekijken
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>

          <div className="mt-9 max-w-3xl divide-y divide-ink-100">
            {citySummaries.map((summary, index) => (
              <FadeIn key={summary.city} delay={Math.min(index, 6) * 0.04}>
                <Link
                  href={`/appartements?city=${encodeURIComponent(summary.city)}`}
                  className="group flex items-center gap-4 py-4 sm:gap-6 sm:py-5"
                >
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-sand-200 sm:h-28 sm:w-44">
                    {summary.imageUrl ? (
                      <Image src={summary.imageUrl} alt={`Appartement in ${summary.city}`} fill sizes="(max-width: 640px) 112px, 176px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-canal-500"><MapPin className="h-7 w-7" /></span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xl font-extrabold text-canal-700 sm:text-2xl">{summary.city}</h3>
                    <p className="mt-1 text-sm text-ink-600 sm:text-base">{summary.count} appartement{summary.count > 1 ? 's' : ''}</p>
                    <p className="mt-0.5 text-sm text-ink-500 sm:text-base">Gem. {formatPrice(summary.averagePrice)} / maand</p>
                  </div>
                  <ArrowRight className="h-7 w-7 shrink-0 text-canal-500 transition-transform group-hover:translate-x-1 sm:h-8 sm:w-8" />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="container-app">
        <div className="canal-divider" />
      </div>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <SectionHeading
              eyebrow="Processus"
              title="Hoe werkt het"
              description="Van zoeken tot verhuizen: een traject dat uw leven eenvoudiger maakt."
              align="center"
              className="mx-auto"
            />
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08}>
                <div className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                  <span className="text-eyebrow text-ink-300">Stap {i + 1}</span>
                  <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-canal-50 text-canal-700">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3} className="mt-10 text-center">
            <Link href="/comment-ca-marche">
              <Button variant="ghost">
                Meer over ons proces
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* TÉMOIGNAGES CLIENTS */}
      <section className="border-y border-ink-100 bg-sand-100/60 py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <SectionHeading
              eyebrow="Ervaringen"
              title="Wat onze klanten over RealEstate zeggen"
              description="Feedback van klanten die zijn begeleid bij hun zoektocht naar een woning in Nederland. Blader door 50 ervaringen."
            />
          </FadeIn>

          <div className="mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-width:thin]">
            {DUTCH_TESTIMONIALS.map((testimonial, index) => (
              <article
                key={index}
                className="flex min-h-64 w-[85vw] max-w-sm shrink-0 snap-start flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:w-80"
              >
                <div className="flex items-center justify-between gap-3">
                  <Quote className="h-7 w-7 text-canal-500" aria-hidden="true" />
                  <div className="flex gap-0.5 text-amber-400" aria-label="5 sterren op 5">
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                </div>
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-ink-600" lang="nl">
                  “{testimonial}”
                </blockquote>
                <p className="mt-5 border-t border-ink-100 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Klant van RealEstate · Ervaring {index + 1}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="pb-20">
        <div className="container-app">
          <FadeIn>
            <div className="overflow-hidden rounded-3xl bg-ink-700 px-6 py-14 text-center sm:px-16">
              <h2 className="text-display-sm font-extrabold text-white sm:text-display-md">
                Klaar om uw nieuwe woning te vinden?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sand-200">
                Bekijk onze geverifieerde advertenties en plan in enkele minuten een bezichtiging.
              </p>
              <Link href="/appartements" className="mt-7 inline-block">
                <Button variant="secondary" size="lg">
                  Bekijk beschikbare appartementen
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
