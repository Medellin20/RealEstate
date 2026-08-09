import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, KeyRound, CalendarCheck, Building2 } from 'lucide-react';
import { HeroSearchBar } from '@/components/properties/hero-search-bar';
import { PropertyCard } from '@/components/properties/property-card';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { getFeaturedProperties } from '@/lib/data/properties';
import { DUTCH_CITIES } from '@/lib/utils/constants';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Real Estate NL — Location d’appartements aux Pays-Bas',
  description:
    'Trouvez votre prochain logement aux Pays-Bas. Real Estate NL facilite la recherche, les visites et la réservation d’appartements à Amsterdam, Rotterdam, Utrecht et plus encore.',
};

const STEPS = [
  {
    icon: Building2,
    title: 'Recherchez un logement',
    description: 'Filtrez par ville, budget et nombre de chambres parmi nos annonces vérifiées.',
  },
  {
    icon: CalendarCheck,
    title: 'Réservez une visite',
    description: 'Choisissez une date et un créneau, réglez les frais de visite en ligne.',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurisez votre dossier',
    description: 'Versez la garantie de réservation et suivez son traitement en temps réel.',
  },
  {
    icon: KeyRound,
    title: 'Emménagez',
    description: 'Votre dossier validé, récupérez les clés de votre nouveau logement.',
  },
];

const TRUST_POINTS = [
  { value: '6', label: 'villes couvertes aux Pays-Bas' },
  { value: '100%', label: 'annonces vérifiées par l’agence' },
  { value: '48h', label: 'délai moyen de réponse à une demande' },
];

export default async function HomePage() {
  const featured = await getFeaturedProperties(6);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1800&q=80"
            alt="Façades de canal typiques aux Pays-Bas"
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
        </div>

        <div className="container-app relative pb-16 pt-20 sm:pb-24 sm:pt-28 lg:pt-32">
          <FadeIn>
            <span className="text-eyebrow inline-block rounded-full bg-white/10 px-3 py-1.5 uppercase text-sand-200">
              Agence spécialisée — Pays-Bas
            </span>
            <h1 className="mt-5 max-w-2xl text-display-md font-extrabold text-white sm:text-display-lg">
              Trouvez votre prochain logement aux Pays-Bas
            </h1>
            <p className="mt-4 max-w-xl text-base text-sand-200 sm:text-lg">
              Real Estate NL facilite la recherche, les visites et la réservation d’appartements
              aux Pays-Bas — un accompagnement clair, sécurisé et sans mauvaise surprise.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-8 max-w-4xl">
            <HeroSearchBar />
          </FadeIn>

          <FadeIn delay={0.25} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sand-300">
            <span>Villes populaires :</span>
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

      {/* LOGEMENTS DISPONIBLES */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Sélection"
                title="Logements disponibles"
                description="Un aperçu de nos annonces les plus récentes, vérifiées par notre équipe."
              />
              <Link href="/appartements">
                <Button variant="outline">
                  Voir tous les appartements
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property, i) => (
              <FadeIn key={property.id} delay={Math.min(i, 5) * 0.06}>
                <PropertyCard property={property} />
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
              title="Comment ça marche"
              description="De la recherche à l’emménagement, un parcours pensé pour vous simplifier la vie."
              align="center"
              className="mx-auto"
            />
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08}>
                <div className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                  <span className="text-eyebrow text-ink-300">Étape {i + 1}</span>
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
                En savoir plus sur notre processus
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="pb-20">
        <div className="container-app">
          <FadeIn>
            <div className="overflow-hidden rounded-3xl bg-ink-700 px-6 py-14 text-center sm:px-16">
              <h2 className="text-display-sm font-extrabold text-white sm:text-display-md">
                Prêt à trouver votre nouveau logement ?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sand-200">
                Parcourez nos annonces vérifiées et réservez une visite en quelques minutes.
              </p>
              <Link href="/appartements" className="mt-7 inline-block">
                <Button variant="secondary" size="lg">
                  Voir les appartements disponibles
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
