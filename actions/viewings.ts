'use server';

import { revalidatePath } from 'next/cache';

import { createAdminClient } from '@/lib/supabase/admin';
import { upsertClient } from '@/lib/data/clients';
import { recordStatusChange } from '@/lib/data/history';
import {
  viewingRequestSchema,
  type ViewingRequestInput,
} from '@/lib/validations/viewing';
import { generateReference } from '@/lib/utils/reference';
import { sendAdminAlert } from '@/lib/notifications/email';
import type { ActionResult } from '@/types';

export async function createViewingRequest(
  input: ViewingRequestInput,
  propertySlug: string
): Promise<ActionResult<{ reference: string }>> {
  /*
   * Validation du formulaire.
   */
  const parsed =
    viewingRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        'Merci de corriger les champs indiqués.',
      fieldErrors:
        parsed.error.flatten().fieldErrors,
    };
  }

  /*
   * Connexion Supabase administrateur.
   */
  const supabase = createAdminClient();

  /*
   * Vérification du logement.
   */
  const {
    data: property,
    error: propertyError,
  } = await supabase
    .from('properties')
    .select(
      'id, title, status, is_published'
    )
    .eq('id', parsed.data.propertyId)
    .maybeSingle();

  if (propertyError) {
    console.error(
      'PROPERTY ERROR:',
      propertyError
    );

    return {
      success: false,
      message:
        'Impossible de vérifier le logement. Merci de réessayer.',
    };
  }

  if (
    !property ||
    !property.is_published
  ) {
    return {
      success: false,
      message:
        'Ce logement n’est plus disponible.',
    };
  }

  /*
   * Création ou mise à jour du client.
   */
  let client;

  try {
    client = await upsertClient({
      firstName:
        parsed.data.firstName,

      lastName:
        parsed.data.lastName,

      email:
        parsed.data.email,

      phone:
        parsed.data.phone,
    });
  } catch (error) {
    console.error(
      'CLIENT ERROR:',
      error
    );

    return {
      success: false,
      message:
        'Impossible d’enregistrer vos informations. Merci de réessayer.',
    };
  }

  /*
   * Génération de la référence.
   */
  const reference =
    generateReference('VIS');

  const initialStatus = 'pending';

  /*
   * Création de la demande de visite.
   */
  const {
    data: viewing,
    error: insertError,
  } = await supabase
    .from('viewing_requests')
    .insert({
      reference,

      property_id:
        property.id,

      client_id:
        client.id,

      requested_date:
        parsed.data.requestedDate,

      requested_time_slot:
        parsed.data.requestedTimeSlot,

      status:
        initialStatus,

      fee_amount: 0,
    })
    .select('*')
    .single();

  if (
    insertError ||
    !viewing
  ) {
    console.error(
      'VIEWING REQUEST ERROR:',
      insertError
    );

    return {
      success: false,
      message:
        'Une erreur est survenue lors de l’enregistrement de votre demande. Merci de réessayer.',
    };
  }

  /*
   * Historique.
   */
  try {
    await recordStatusChange({
      entityType:
        'viewing_request',

      entityId:
        viewing.id,

      fromStatus:
        null,

      toStatus:
        initialStatus,

      changedBy:
        'client',
    });
  } catch (error) {
    console.error(
      'HISTORY ERROR:',
      error
    );
  }

  /*
   * Envoi de l'e-mail administrateur.
   */
  const emailResult =
    await sendAdminAlert(
      `Nouvelle demande de visite — ${reference}`,
      {
        Référence:
          reference,

        Logement:
          property.title,

        Client:
          `${parsed.data.firstName} ${parsed.data.lastName}`,

        Email:
          parsed.data.email,

        Téléphone:
          parsed.data.phone,

        Date:
          parsed.data.requestedDate,

        Créneau:
          parsed.data.requestedTimeSlot,
      }
    );

  /*
   * L'e-mail est uniquement une notification.
   * La demande a déjà été enregistrée.
   */
  if (!emailResult.sent) {
    console.error(
      'ADMIN EMAIL FAILED:',
      {
        reference,
        reason:
          emailResult.reason,
      }
    );
  } else {
    console.log(
      `ADMIN EMAIL SENT FOR ${reference}`
    );
  }

  /*
   * Actualisation des pages administrateur.
   */
  revalidatePath(
    '/admin/visites'
  );

  revalidatePath(
    '/admin'
  );

  /*
   * Réponse au formulaire.
   */
  return {
    success: true,

    message:
      'Votre demande de visite a bien été confirmée.',

    data: {
      reference,
    },
  };
}
