'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/data/history';
import { propertySchema, type PropertyInput } from '@/lib/validations/property';
import type { ActionResult } from '@/types';
import type { Property, PropertyStatus } from '@/types/database';
import { generatePropertyDescription, generatePropertyDescriptionFromProperty } from '@/lib/utils/property-description';

function toDbPayload(data: PropertyInput, description: string) {
  return {
    title: data.title,
    slug: data.slug,
    description,
    property_type: data.propertyType,
    address: data.address || null,
    city: data.city,
    postal_code: data.postalCode || null,
    neighborhood: data.neighborhood || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    monthly_price: data.monthlyPrice,
    service_charges: data.serviceCharges,
    deposit_amount: data.depositAmount,
    surface_m2: data.surfaceM2,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    rooms: data.rooms ?? null,
    floor: data.floor ?? null,
    floors_count: data.floorsCount ?? null,
    volume_m3: data.volumeM3 ?? null,
    contract_type: data.contractType,
    interior_type: data.interiorType,
    maintenance_condition: data.maintenanceCondition,
    construction_type: data.constructionType,
    construction_year: data.constructionYear ?? null,
    energy_label: data.energyLabel || null,
    has_elevator: data.hasElevator,
    has_balcony: data.hasBalcony,
    has_terrace: data.hasTerrace,
    has_parking: data.hasParking,
    has_garage: data.hasGarage,
    has_garden: data.hasGarden,
    is_furnished: data.isFurnished,
    available_from: data.availableFrom || null,
    minimum_stay_months: data.minimumStayMonths,
    status: data.status,
    is_published: data.isPublished,
    is_featured: data.isFeatured,
  };
}

async function getAmenityLabels(amenityIds: string[]) {
  if (amenityIds.length === 0) return [];
  const supabase = createAdminClient();
  const { data } = await supabase.from('amenities').select('label_fr').in('id', amenityIds);
  return data?.map((amenity) => amenity.label_fr) ?? [];
}

async function syncAmenities(propertyId: string, amenityIds: string[]) {
  const supabase = createAdminClient();
  await supabase.from('property_amenities').delete().eq('property_id', propertyId);
  if (amenityIds.length > 0) {
    await supabase
      .from('property_amenities')
      .insert(amenityIds.map((amenityId) => ({ property_id: propertyId, amenity_id: amenityId })));
  }
}

function revalidatePublicPaths(slug?: string) {
  revalidatePath('/admin');
  revalidatePath('/appartements');
  revalidatePath('/');
  revalidatePath('/admin/appartements');
  if (slug) revalidatePath(`/appartements/${slug}`);
}

/** Vérifie le titre et le slug pendant la saisie, avant de remplir tout le formulaire. */
export async function checkPropertyAvailability(
  title: string,
  slug: string,
  excludePropertyId?: string
): Promise<{ available: boolean; matchedBy?: 'title' | 'slug' }> {
  const normalizedTitle = title.trim();
  const normalizedSlug = slug.trim();

  if (!normalizedTitle && !normalizedSlug) return { available: true };

  const supabase = createAdminClient();
  let slugQuery = supabase.from('properties').select('id').eq('slug', normalizedSlug);
  let titleQuery = supabase.from('properties').select('id, title').ilike('title', normalizedTitle);

  if (excludePropertyId) {
    slugQuery = slugQuery.neq('id', excludePropertyId);
    titleQuery = titleQuery.neq('id', excludePropertyId);
  }

  const [{ data: slugMatch, error: slugError }, { data: titleMatches, error: titleError }] =
    await Promise.all([slugQuery.maybeSingle(), titleQuery]);

  if (slugError || titleError) throw slugError ?? titleError;
  if (slugMatch) return { available: false, matchedBy: 'slug' };

  const exactTitleMatch = titleMatches?.some(
    (property) => property.title.trim().toLocaleLowerCase() === normalizedTitle.toLocaleLowerCase()
  );
  if (exactTitleMatch) return { available: false, matchedBy: 'title' };

  return { available: true };
}

export async function createProperty(input: PropertyInput): Promise<ActionResult<{ id: string }>> {
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existingSlug } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle();

  if (existingSlug) {
    return {
      success: false,
      message: 'Ce slug est déjà utilisé par un autre logement.',
      fieldErrors: { slug: ['Ce slug est déjà utilisé.'] },
    };
  }

  const amenityLabels = await getAmenityLabels(parsed.data.amenityIds);
  const { data: property, error } = await supabase
    .from('properties')
    .insert(toDbPayload(parsed.data, generatePropertyDescription(parsed.data, amenityLabels)))
    .select('id')
    .single();

  if (error || !property) {
    return { success: false, message: 'Une erreur est survenue lors de la création du logement.' };
  }

  await syncAmenities(property.id, parsed.data.amenityIds);
  await logAdminAction({ action: 'property.create', entityType: 'property', entityId: property.id });
  revalidatePublicPaths(parsed.data.slug);

  return { success: true, message: 'Appartement ajouté avec succès.', data: { id: property.id } };
}

export async function updateProperty(id: string, input: PropertyInput): Promise<ActionResult> {
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existingSlug } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', parsed.data.slug)
    .neq('id', id)
    .maybeSingle();

  if (existingSlug) {
    return {
      success: false,
      message: 'Ce slug est déjà utilisé par un autre logement.',
      fieldErrors: { slug: ['Ce slug est déjà utilisé.'] },
    };
  }

  const amenityLabels = await getAmenityLabels(parsed.data.amenityIds);
  const { error } = await supabase
    .from('properties')
    .update(toDbPayload(parsed.data, generatePropertyDescription(parsed.data, amenityLabels)))
    .eq('id', id);

  if (error) {
    return { success: false, message: 'Une erreur est survenue lors de la mise à jour du logement.' };
  }

  await syncAmenities(id, parsed.data.amenityIds);
  await logAdminAction({ action: 'property.update', entityType: 'property', entityId: id });
  revalidatePublicPaths(parsed.data.slug);

  return { success: true, message: 'Appartement mis à jour avec succès.' };
}

/** Régénère les descriptions des appartements actuellement publics et disponibles. */
export async function regenerateAvailablePropertyDescriptions(): Promise<ActionResult<{ updated: number }>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_amenities(amenities(label_fr))')
    .eq('is_published', true)
    .eq('status', 'available');

  if (error) {
    return { success: false, message: 'Impossible de récupérer les logements disponibles.' };
  }

  const results = await Promise.all((data ?? []).map(async (property: any) => {
    const amenityLabels = (property.property_amenities ?? [])
      .map((item: { amenities?: { label_fr?: string } | null }) => item.amenities?.label_fr)
      .filter((label: unknown): label is string => typeof label === 'string');
    const { error: updateError } = await supabase
      .from('properties')
      .update({ description: generatePropertyDescriptionFromProperty(property as Property, amenityLabels) })
      .eq('id', property.id);
    return updateError;
  }));
  const failures = results.filter(Boolean).length;

  if (failures > 0) {
    return { success: false, message: `${failures} description(s) n’ont pas pu être générée(s).` };
  }

  revalidatePublicPaths();
  return { success: true, message: `${data?.length ?? 0} description(s) générée(s).`, data: { updated: data?.length ?? 0 } };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: images } = await supabase.from('property_images').select('storage_path').eq('property_id', id);
  if (images && images.length > 0) {
    await supabase.storage.from('property-images').remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) {
    return { success: false, message: 'Impossible de supprimer ce logement.' };
  }

  await logAdminAction({ action: 'property.delete', entityType: 'property', entityId: id });
  revalidatePublicPaths();

  return { success: true, message: 'Appartement supprimé.' };
}

export async function updatePropertyStatus(id: string, status: PropertyStatus): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('properties').update({ status }).eq('id', id).select('slug').single();

  if (error) {
    return { success: false, message: 'Impossible de mettre à jour le statut.' };
  }

  await logAdminAction({ action: 'property.status_change', entityType: 'property', entityId: id, details: { status } });
  revalidatePublicPaths(data?.slug);

  return { success: true, message: 'Statut mis à jour.' };
}

export async function togglePropertyPublish(id: string, isPublished: boolean): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('properties')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select('slug')
    .single();

  if (error) {
    return { success: false, message: 'Impossible de mettre à jour la publication.' };
  }

  await logAdminAction({
    action: isPublished ? 'property.publish' : 'property.unpublish',
    entityType: 'property',
    entityId: id,
  });
  revalidatePublicPaths(data?.slug);

  return { success: true, message: isPublished ? 'Logement publié.' : 'Logement dépublié.' };
}
