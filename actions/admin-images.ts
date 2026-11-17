'use server';

import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/data/history';
import type { ActionResult } from '@/types';
import type { PropertyImage } from '@/types/database';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

/**
 * Téléverse les images vers Supabase Storage et crée les lignes correspondantes.
 * La première image uploadée devient automatiquement l'image principale
 * si le logement n'en a pas encore.
 */
export async function uploadPropertyImages(propertyId: string, formData: FormData): Promise<ActionResult<PropertyImage[]>> {
  const supabase = createAdminClient();
  const files = formData.getAll('images') as File[];

  if (!files || files.length === 0) {
    return { success: false, message: 'Geen afbeelding geselecteerd.' };
  }

  const { data: property } = await supabase.from('properties').select('slug').eq('id', propertyId).maybeSingle();
  if (!property) {
    return { success: false, message: 'Woning niet gevonden.' };
  }

  const { count: existingCount } = await supabase
    .from('property_images')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId);

  const { data: maxOrderRow } = await supabase
    .from('property_images')
    .select('sort_order')
    .eq('property_id', propertyId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrder = (maxOrderRow?.sort_order ?? -1) + 1;
  const uploaded: PropertyImage[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;

    if (!ALLOWED_TYPES.includes(file.type)) {
      continue; // type non supporté, on ignore silencieusement ce fichier
    }
    if (file.size > MAX_SIZE) {
      continue; // fichier trop volumineux
    }

    const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const storagePath = `${property.slug}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error('Supabase image upload failed:', uploadError.message);
      continue;
    }

    const { data: publicUrl } = supabase.storage.from('property-images').getPublicUrl(storagePath);

    const { data: imageRow, error: insertError } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        storage_path: storagePath,
        url: publicUrl.publicUrl,
        is_primary: existingCount === 0 && uploaded.length === 0,
        sort_order: nextOrder,
      })
      .select('*')
      .single();

    if (!insertError && imageRow) {
      uploaded.push(imageRow);
      nextOrder += 1;
    } else {
      await supabase.storage.from('property-images').remove([storagePath]);
    }
  }

  if (uploaded.length === 0) {
    return { success: false, message: 'Er kon geen afbeelding worden geüpload (formaat of bestandsgrootte niet ondersteund).' };
  }

  await logAdminAction({
    action: 'property.images_upload',
    entityType: 'property',
    entityId: propertyId,
    details: { count: uploaded.length },
  });

  revalidatePath(`/admin/appartements/${propertyId}`);
  revalidatePath(`/appartements/${property.slug}`);
  revalidatePath('/appartements');

  return { success: true, message: `${uploaded.length} afbeelding(en) toegevoegd.`, data: uploaded };
}

export async function deletePropertyImage(imageId: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: image } = await supabase
    .from('property_images')
    .select('*, properties(slug)')
    .eq('id', imageId)
    .maybeSingle();

  if (!image) {
    return { success: false, message: 'Afbeelding niet gevonden.' };
  }

  const { error: deleteError } = await supabase.from('property_images').delete().eq('id', imageId);
  if (deleteError) {
    return { success: false, message: 'De foto kon niet uit de database worden verwijderd.' };
  }

  const storagePath = image.storage_path.startsWith('imagekit:') ? null : image.storage_path;
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from('property-images').remove([storagePath]);
    if (storageError) console.error('Supabase image cleanup failed:', storageError.message);
  }

  // Si l'image supprimée était la principale, promouvoir la suivante.
  if (image.is_primary) {
    const { data: nextImage } = await supabase
      .from('property_images')
      .select('id')
      .eq('property_id', image.property_id)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextImage) {
      const { error: primaryError } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', nextImage.id);

      if (primaryError) {
        console.error('Promotion de l’image principale impossible:', primaryError.message);
      }
    }
  }

  revalidatePath(`/admin/appartements/${image.property_id}`);
  const slug = (image as any).properties?.slug;
  if (slug) revalidatePath(`/appartements/${slug}`);
  revalidatePath('/appartements');

  return { success: true, message: 'Foto verwijderd.' };
}

export async function setPrimaryPropertyImage(propertyId: string, imageId: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('property_images').update({ is_primary: true }).eq('property_id', propertyId).eq('id', imageId).select('id').single();
  if (error) {
    return { success: false, message: 'De hoofdafbeelding kon niet worden ingesteld.' };
  }

  const { data: property } = await supabase.from('properties').select('slug').eq('id', propertyId).maybeSingle();

  revalidatePath(`/admin/appartements/${propertyId}`);
  if (property?.slug) revalidatePath(`/appartements/${property.slug}`);
  revalidatePath('/appartements');
  revalidatePath('/');

  return { success: true, message: 'Hoofdafbeelding bijgewerkt.' };
}

export async function reorderPropertyImages(propertyId: string, orderedImageIds: string[]): Promise<ActionResult> {
  const supabase = createAdminClient();

  const results = await Promise.all(
    orderedImageIds.map((id, index) =>
      supabase.from('property_images').update({ sort_order: index }).eq('property_id', propertyId).eq('id', id).select('id').single()
    )
  );

  revalidatePath('/', 'layout');
  if (results.some((result) => result.error)) {
    return { success: false, message: 'De volgorde van de fotos kon niet volledig worden opgeslagen. Vernieuw de pagina en probeer het opnieuw.' };
  }
  return { success: true, message: 'Volgorde van fotos bijgewerkt.' };
}
