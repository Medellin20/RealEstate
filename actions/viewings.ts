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
import { getPropertyEmailDetails } from '@/lib/notifications/property-details';
import { recordRequestSubmission } from '@/lib/data/request-submissions';
import { formatPrice } from '@/lib/utils/format';
import type { ActionResult } from '@/types';
import { getSiteSettings } from '@/lib/data/site-settings';

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
        'Corrigeer de gemarkeerde velden.',
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
    .select('*')
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
        'De woning kan niet worden gecontroleerd. Probeer het opnieuw.',
    };
  }

  if (
    !property ||
    !property.is_published
  ) {
    return {
      success: false,
      message:
        'Deze woning is niet meer beschikbaar.',
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
        'Uw gegevens kunnen niet worden opgeslagen. Probeer het opnieuw.',
    };
  }

  /*
   * Génération de la référence.
   */
  const reference =
    generateReference('VIS');

  const viewingFee = (await getSiteSettings()).viewing_fee;
  const initialStatus = 'payment_pending';

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

      fee_amount: viewingFee,
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
        'Er is een fout opgetreden bij het opslaan van uw aanvraag. Probeer het opnieuw.',
    };
  }

  try {
    await recordRequestSubmission({
      requestType: 'viewing',
      sourceId: viewing.id,
      reference,
      propertyId: property.id,
      clientId: client.id,
      formData: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        requestedDate: parsed.data.requestedDate,
        requestedTimeSlot: parsed.data.requestedTimeSlot,
      },
    });
  } catch (error) {
    console.error('VIEWING SUBMISSION ARCHIVE ERROR:', { reference, error });
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

        ...getPropertyEmailDetails(
          property,
          await getAmenityLabels(property.id)
        ),
        'Frais de visite': formatPrice(viewingFee),
        'Lien de paiement': (await getSiteSettings()).payment_link,

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
      'Uw bezoekaanvraag is succesvol bevestigd.',

    data: {
      reference,
    },
  };
}

async function getAmenityLabels(propertyId: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('property_amenities')
    .select('amenities(label_fr)')
    .eq('property_id', propertyId);

  return (data ?? [])
    .map((item) => item.amenities?.[0]?.label_fr)
    .filter((label): label is string => Boolean(label));
}
