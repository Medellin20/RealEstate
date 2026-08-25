'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Wand2, Save } from 'lucide-react';
import { propertySchema, type PropertyInput } from '@/lib/validations/property';
import { createProperty, updateProperty } from '@/actions/admin-properties';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label, FieldError } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PROPERTY_TYPES } from '@/lib/utils/constants';
import { slugify } from '@/lib/utils/format';
import type { Amenity, Property } from '@/types/database';

const BOOLEAN_FIELDS: { key: keyof PropertyInput; label: string }[] = [
  { key: 'hasElevator', label: 'Ascenseur' },
  { key: 'hasBalcony', label: 'Balcon' },
  { key: 'hasTerrace', label: 'Terrasse' },
  { key: 'hasParking', label: 'Parking' },
  { key: 'hasGarage', label: 'Garage' },
  { key: 'hasGarden', label: 'Jardin' },
  { key: 'isFurnished', label: 'Meublé' },
  { key: 'petsAllowed', label: 'Animaux autorisés' },
];

function propertyToFormValues(property: Property, amenityIds: string[]): PropertyInput {
  return {
    title: property.title,
    slug: property.slug,
    propertyType: property.property_type,
    address: property.address ?? '',
    city: property.city,
    postalCode: property.postal_code ?? '',
    neighborhood: property.neighborhood ?? '',
    latitude: property.latitude ?? undefined,
    longitude: property.longitude ?? undefined,
    monthlyPrice: property.monthly_price,
    serviceCharges: property.service_charges,
    depositAmount: property.deposit_amount,
    viewingFee: property.viewing_fee,
    surfaceM2: property.surface_m2,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    rooms: property.rooms ?? undefined,
    floor: property.floor ?? undefined,
    floorsCount: property.floors_count ?? undefined,
    volumeM3: property.volume_m3 ?? undefined,
    contractType: property.contract_type,
    interiorType: property.interior_type,
    maintenanceCondition: property.maintenance_condition,
    constructionType: property.construction_type,
    constructionYear: property.construction_year ?? undefined,
    energyLabel: property.energy_label ?? '',
    hasElevator: property.has_elevator,
    hasBalcony: property.has_balcony,
    hasTerrace: property.has_terrace,
    hasParking: property.has_parking,
    hasGarage: property.has_garage,
    hasGarden: property.has_garden,
    isFurnished: property.is_furnished,
    petsAllowed: property.pets_allowed,
    availableFrom: property.available_from ?? '',
    minimumStayMonths: property.minimum_stay_months ?? 12,
    status: property.status,
    isPublished: property.is_published,
    isFeatured: property.is_featured,
    amenityIds,
  };
}

export function PropertyForm({
  mode,
  propertyId,
  property,
  currentAmenityIds,
  amenities,
}: {
  mode: 'create' | 'edit';
  propertyId?: string;
  property?: Property;
  currentAmenityIds?: string[];
  amenities: Amenity[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [slugTouched, setSlugTouched] = React.useState(mode === 'edit');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues:
      mode === 'edit' && property
        ? propertyToFormValues(property, currentAmenityIds ?? [])
        : {
            title: '',
            slug: '',
            propertyType: 'appartement',
            city: '',
            monthlyPrice: 0,
            serviceCharges: 0,
            depositAmount: 0,
            viewingFee: 0,
            surfaceM2: 0,
            bedrooms: 1,
            bathrooms: 1,
            contractType: 'Période indéterminée',
            interiorType: 'Non meublé',
            maintenanceCondition: 'Bien',
            constructionType: 'Bâtiment existant',
            hasElevator: false,
            hasBalcony: false,
            hasTerrace: false,
            hasParking: false,
            hasGarage: false,
            hasGarden: false,
            isFurnished: false,
            petsAllowed: false,
            minimumStayMonths: 12,
            status: 'draft',
            isPublished: false,
            isFeatured: false,
            amenityIds: [],
          },
  });

  const title = watch('title');

  React.useEffect(() => {
    if (!slugTouched && title) {
      setValue('slug', slugify(title));
    }
  }, [title, slugTouched, setValue]);

  function onSubmit(data: PropertyInput) {
    startTransition(async () => {
      const result =
        mode === 'create' ? await createProperty(data) : await updateProperty(propertyId!, data);

      if (result.success) {
        toast.success(result.message);
        if (mode === 'create' && result.data?.id) {
          router.push(`/admin/appartements/${result.data.id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* INFORMATIONS GÉNÉRALES */}
      <FormSection title="Informations générales">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" {...register('title')} />
            <FieldError message={errors.title?.message} />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Slug (URL)</Label>
              <button
                type="button"
                onClick={() => {
                  setValue('slug', slugify(title || ''));
                  setSlugTouched(false);
                }}
                className="mb-1.5 flex items-center gap-1 text-xs font-medium text-canal-600 hover:underline"
              >
                <Wand2 className="h-3 w-3" />
                Générer depuis le titre
              </button>
            </div>
            <Input id="slug" {...register('slug')} onChange={() => setSlugTouched(true)} />
            <FieldError message={errors.slug?.message} />
          </div>
          <div>
            <Label htmlFor="propertyType">Type de logement</Label>
            <Select id="propertyType" {...register('propertyType')}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select id="status" {...register('status')}>
              <option value="draft">Brouillon</option>
              <option value="available">Disponible</option>
              <option value="reserved">Réservé</option>
              <option value="rented">Loué</option>
              <option value="unavailable">Indisponible</option>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
            <Checkbox {...register('isPublished')} />
            Publié (visible sur le site public)
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
            <Checkbox {...register('isFeatured')} />
            Mettre en avant sur la page d’accueil
          </label>
        </div>
      </FormSection>

      {/* LOCALISATION */}
      <FormSection title="Localisation">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="address">Adresse complète</Label>
            <Input id="address" placeholder="Communiquée au client après confirmation de la visite" {...register('address')} />
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input id="city" placeholder="Ex : Amsterdam" {...register('city')} />
            <FieldError message={errors.city?.message} />
          </div>
          <div>
            <Label htmlFor="postalCode">Code postal</Label>
            <Input id="postalCode" {...register('postalCode')} />
          </div>
          <div>
            <Label htmlFor="neighborhood">Quartier</Label>
            <Input id="neighborhood" {...register('neighborhood')} />
          </div>
        </div>
      </FormSection>

      {/* TARIFS */}
      <FormSection title="Tarifs">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
          <div>
            <Label htmlFor="monthlyPrice">Prix mensuel (€)</Label>
            <Input id="monthlyPrice" type="number" step="1" {...register('monthlyPrice')} />
            <FieldError message={errors.monthlyPrice?.message} />
          </div>
          <div>
            <Label htmlFor="depositAmount">Dépôt (€)</Label>
            <Input id="depositAmount" type="number" step="1" {...register('depositAmount')} />
          </div>
        </div>
      </FormSection>

      {/* CARACTÉRISTIQUES */}
      <FormSection title="Caractéristiques">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-4">
          <div>
            <Label htmlFor="surfaceM2">Surface (m²)</Label>
            <Input id="surfaceM2" type="number" step="0.5" {...register('surfaceM2')} />
            <FieldError message={errors.surfaceM2?.message} />
          </div>
          <div>
            <Label htmlFor="bedrooms">Chambres</Label>
            <Input id="bedrooms" type="number" {...register('bedrooms')} />
          </div>
          <div>
            <Label htmlFor="bathrooms">Salles de bain</Label>
            <Input id="bathrooms" type="number" {...register('bathrooms')} />
          </div>
          <div>
            <Label htmlFor="rooms">Nombre de pièces</Label>
            <Input id="rooms" type="number" {...register('rooms')} />
          </div>
          <div>
            <Label htmlFor="floor">Étage</Label>
            <Input id="floor" type="number" {...register('floor')} />
          </div>
          <div>
            <Label htmlFor="floorsCount">Nombre d’étages</Label>
            <Input id="floorsCount" type="number" min="1" {...register('floorsCount')} />
          </div>
          <div>
            <Label htmlFor="volumeM3">Volume (m³)</Label>
            <Input id="volumeM3" type="number" step="0.5" {...register('volumeM3')} />
          </div>
          <div>
            <Label htmlFor="availableFrom">Disponible à partir du</Label>
            <Input id="availableFrom" type="date" {...register('availableFrom')} />
          </div>
          <div>
            <Label htmlFor="minimumStayMonths">Durée minimale (mois)</Label>
            <Input id="minimumStayMonths" type="number" {...register('minimumStayMonths')} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
          {BOOLEAN_FIELDS.map((field) => (
            <label key={field.key} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
              <Checkbox {...register(field.key as any)} />
              {field.label}
            </label>
          ))}
        </div>
      </FormSection>

      <FormSection title="Location et état du logement">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="contractType">Type de contrat</Label>
            <Select id="contractType" {...register('contractType')}>
              <option value="Période indéterminée">Période indéterminée</option>
              <option value="Durée déterminée">Durée déterminée</option>
              <option value="Location temporaire">Location temporaire</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="interiorType">Intérieur</Label>
            <Select id="interiorType" {...register('interiorType')}>
              <option value="Non meublé">Non meublé</option>
              <option value="Semi-meublé">Semi-meublé</option>
              <option value="Meublé">Meublé</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="maintenanceCondition">État d’entretien</Label>
            <Select id="maintenanceCondition" {...register('maintenanceCondition')}>
              <option value="Excellent">Excellent</option>
              <option value="Bien">Bien</option>
              <option value="À rafraîchir">À rafraîchir</option>
              <option value="À rénover">À rénover</option>
            </Select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Construction et énergie">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="constructionType">Type de construction</Label>
            <Select id="constructionType" {...register('constructionType')}>
              <option value="Bâtiment existant">Bâtiment existant</option>
              <option value="Construction neuve">Construction neuve</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="constructionYear">Année de construction</Label>
            <Input id="constructionYear" type="number" min="1000" max="2200" {...register('constructionYear')} />
          </div>
          <div>
            <Label htmlFor="energyLabel">Étiquette énergétique</Label>
            <Select id="energyLabel" {...register('energyLabel')}>
              <option value="">Non renseignée</option>
              {['A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </Select>
          </div>
        </div>
      </FormSection>

      {/* ÉQUIPEMENTS */}
      <FormSection title="Équipements">
        <Controller
          control={control}
          name="amenityIds"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
              {amenities.map((amenity) => {
                const checked = field.value?.includes(amenity.id);
                return (
                  <label key={amenity.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) field.onChange([...(field.value ?? []), amenity.id]);
                        else field.onChange((field.value ?? []).filter((id) => id !== amenity.id));
                      }}
                    />
                    {amenity.label_fr}
                  </label>
                );
              })}
            </div>
          )}
        />
      </FormSection>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" isLoading={isPending} className="w-full shadow-lifted sm:w-auto">
          <Save className="h-4.5 w-4.5" />
          {mode === 'create' ? 'Créer l’appartement' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <h2 className="mb-4 font-bold text-ink-900">{title}</h2>
      {children}
    </div>
  );
}
