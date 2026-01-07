import { decode } from "base64-arraybuffer";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

function guessContentType(ext: string) {
  const e = ext.toLowerCase();
  if (e === "png") return "image/png";
  if (e === "webp") return "image/webp";
  if (e === "heic") return "image/heic";
  return "image/jpeg";
}

async function resolveBase64(base64: string | undefined, uri: string) {
  if (base64) return base64;
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function uploadWardrobeImage(params: {
  base64?: string;
  uri: string;
  userId: string;
}) {
  const { base64, uri, userId } = params;

  const ext = (uri.split(".").pop() || "jpg").toLowerCase();
  const fileName = `${Crypto.randomUUID()}.${ext}`;
  const path = `${userId}/${fileName}`;

  const resolvedBase64 = await resolveBase64(base64, uri);
  const bytes = new Uint8Array(decode(resolvedBase64));

  const { error } = await supabase.storage.from("wardrobe").upload(path, bytes, {
    contentType: guessContentType(ext),
    upsert: false,
  });

  if (error) throw error;

  return { path };
}
