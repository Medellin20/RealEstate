import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "property-images";
const TABLE = "property_images";

// true = diagnostic uniquement
// false = applique réellement les corrections
const DRY_RUN = true;

async function urlExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

async function repairImages() {
  const { data: images, error } = await supabase
    .from(TABLE)
    .select("id, property_id, storage_path, url");

  if (error) {
    console.error("Erreur lecture table :", error);
    return;
  }

  console.log(`${images.length} images trouvées.`);

  let broken = 0;
  let repaired = 0;

  for (const image of images) {
    if (!image.storage_path) {
      console.log("⚠️ storage_path vide :", image.id);
      continue;
    }

    const {
      data: { publicUrl }
    } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(image.storage_path);

    const currentUrlOk = image.url
      ? await urlExists(image.url)
      : false;

    const generatedUrlOk = await urlExists(publicUrl);

    if (currentUrlOk) {
      continue;
    }

    broken++;

    console.log("\n❌ URL cassée");
    console.log("ID :", image.id);
    console.log("Property :", image.property_id);
    console.log("Ancienne URL :", image.url);
    console.log("storage_path :", image.storage_path);

    if (!generatedUrlOk) {
      console.log("⚠️ Le fichier indiqué par storage_path n'existe pas non plus.");
      continue;
    }

    console.log("✅ URL correcte trouvée :", publicUrl);

    if (DRY_RUN) {
      console.log("🧪 DRY RUN : aucune modification appliquée.");
      continue;
    }

    const { error: updateError } = await supabase
      .from(TABLE)
      .update({
        url: publicUrl
      })
      .eq("id", image.id);

    if (updateError) {
      console.error("Erreur mise à jour :", updateError);
    } else {
      repaired++;
      console.log("✅ URL réparée.");
    }
  }

  console.log("\n--- Résultat ---");
  console.log("Images cassées :", broken);
  console.log("Images réparées :", repaired);
}

repairImages();