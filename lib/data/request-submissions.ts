import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

type RequestType = 'viewing' | 'reservation_payment';

interface RecordSubmissionInput {
  requestType: RequestType;
  sourceId: string;
  reference: string;
  propertyId: string;
  clientId: string;
  formData: Record<string, unknown>;
}

/** Archive chaque formulaire public dans le registre unifié. */
export async function recordRequestSubmission(input: RecordSubmissionInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('request_submissions').insert({
    request_type: input.requestType,
    source_id: input.sourceId,
    reference: input.reference,
    property_id: input.propertyId,
    client_id: input.clientId,
    form_data: input.formData,
  });

  if (error) throw new Error(error.message);
}
