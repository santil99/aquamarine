import type { SalesImageStorage } from "@/application/ports/salesImageStorage";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

const SALE_IMAGES_BUCKET = "sales-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export const supabaseSalesImageStorage: SalesImageStorage = {
  async upload(path, image, contentType) {
    const { error } = await supabase.storage
      .from(SALE_IMAGES_BUCKET)
      .upload(path, image, { contentType, upsert: false });

    if (error) {
      throw error;
    }
  },

  async createSignedUrls(paths) {
    if (paths.length === 0) return {};

    const { data, error } = await supabase.storage
      .from(SALE_IMAGES_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

    if (error) {
      throw error;
    }

    return Object.fromEntries(
      data.map((item) => {
        if (!item.path || !item.signedUrl) {
          throw new Error(item.error ?? "Missing signed URL");
        }

        return [item.path, item.signedUrl];
      }),
    );
  },

  async remove(paths) {
    if (paths.length === 0) return;

    const { error } = await supabase.storage.from(SALE_IMAGES_BUCKET).remove(paths);

    if (error) {
      throw error;
    }
  },
};
