import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const oldSupabase = createClient(
  process.env.OLD_SUPABASE_URL,
  process.env.OLD_SUPABASE_SERVICE_ROLE_KEY
);

const newSupabase = createClient(
  process.env.NEW_SUPABASE_URL,
  process.env.NEW_SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "property-images";

const { data: images, error } = await newSupabase
  .from("property_images")
  .select("id, storage_path");

if (error) {
  console.error(error);
  process.exit(1);
}

let ok = 0;
let failed = 0;

for (const image of images) {
  const path = image.storage_path;

  try {
    const { data: oldFile, error: downloadError } =
      await oldSupabase.storage
        .from(BUCKET)
        .download(path);

    if (downloadError) {
      console.log("❌ Ancien fichier introuvable :", path);
      failed++;
      continue;
    }

    const buffer = Buffer.from(
      await oldFile.arrayBuffer()
    );

    const { error: uploadError } =
      await newSupabase.storage
        .from(BUCKET)
        .upload(path, buffer, {
          upsert: true,
          contentType: oldFile.type || undefined
        });

    if (uploadError) {
      console.log("❌ Upload échoué :", path, uploadError.message);
      failed++;
      continue;
    }

    ok++;
    console.log(`✅ ${ok} : ${path}`);

  } catch (err) {
    failed++;
    console.log("❌ Erreur :", path, err.message);
  }
}

console.log("\nTerminé");
console.log("Migrés :", ok);
console.log("Échecs :", failed);