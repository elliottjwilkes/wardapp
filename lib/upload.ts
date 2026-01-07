import { decode } from "base64-arraybuffer";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

function guessContentType(ext: string) {
  const e = ext.toLowerCase();
  if (e === "png") return "image/png";
  if (e === "webp") return "image/webp";
  if (e === "heic") return "image/heic";
  return "image/jpeg";
}

export async function uploadWardrobeImageFromBase64(params: {
  base64: string;
  uriHint?: string;
  userId: string;
}) {
  const { base64, uriHint, userId } = params;

  const ext = (uriHint?.split(".").pop() || "jpg").toLowerCase();
  const fileName = `${Crypto.randomUUID()}.${ext}`;
  const path = `${userId}/${fileName}`;

  const bytes = new Uint8Array(decode(base64));

  const { error } = await supabase.storage.from("wardrobe").upload(path, bytes, {
    contentType: guessContentType(ext),
    upsert: false,
  });

  if (error) throw error;

  return { path };
}
