import type { Metadata } from 'next';
import { ShieldCheck, MapPinned, Users, Clock } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Real Estate NL est une agence spécialisée dans la location d’appartements aux Pays-Bas.',
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Confiance',
    description: 'Chaque annonce est vérifiée par notre équipe avant publication.',
  },
  {
    icon: MapPinned,
    title: 'Expertise locale',
    description: 'Une connaissance fine des quartiers d’Amsterdam, Rotterdam, Utrecht et au-delà.',
  },
  {
    icon: Users,
    title: 'Accompagnement',
    description: 'Un suivi personnalisé de la recherche jusqu’à l’emménagement.',
  },
  {
    icon: Clock,
    title: 'Réactivité',
    description: 'Des délais de réponse rapides pour ne pas manquer le bon logement.',
  },
];

export default function AProposPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
        <div className="container-app relative">
          <FadeIn>
            <span className="text-eyebrow uppercase text-sand-300">Notre agence</span>
            <h1 className="mt-3 max-w-2xl text-display-md font-extrabold text-white sm:text-display-lg">
              Votre partenaire de confiance pour louer aux Pays-Bas
            </h1>
            <p className="mt-4 max-w-xl text-sand-200">
              Real Estate NL accompagne particuliers, professionnels et expatriés dans la recherche
              d’un logement à louer, partout aux Pays-Bas.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app max-w-3xl">
          <FadeIn>
            <SectionHeading
              eyebrow="Notre mission"
              title="Simplifier la location d’appartements aux Pays-Bas"
            />
            <p className="mt-4 leading-relaxed text-ink-500">
              Le marché locatif néerlandais peut être complexe, en particulier pour les nouveaux
              arrivants. Real Estate NL a été créée pour offrir un parcours clair et transparent :
              des annonces vérifiées, un processus de visite structuré, et un suivi rigoureux de
              chaque dossier de réservation, de la demande initiale jusqu’à la remise des clés.
            </p>
            <p className="mt-4 leading-relaxed text-ink-500">
              Nous travaillons avec des propriétaires et gestionnaires dans les principales villes
              du pays — Amsterdam, Rotterdam, Utrecht, Eindhoven, La Haye et Groningue — pour
              proposer une sélection de logements adaptés à chaque profil de locataire.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <SectionHeading eyebrow="Nos valeurs" title="Ce qui nous guide au quotidien" align="center" className="mx-auto" />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <FadeIn key={value.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-soft">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-canal-50 text-canal-700">
                    <value.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-ink-900">{value.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
