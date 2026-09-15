import 'server-only';
import { revalidatePath } from 'next/cache';

/** Statuses appear in lists, counters, client dossiers and confirmation pages. */
export function revalidateStatusViews() {
  revalidatePath('/', 'layout');
}
