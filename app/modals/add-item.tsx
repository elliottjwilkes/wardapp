import { Stack, router } from "expo-router";
import { Alert } from "react-native";

import { ItemForm, ItemFormValues } from "@/components/items/ItemForm";
import { Screen } from "@/components/ui/Screen";
import { Body, Title } from "@/components/ui/Typography";
import { supabase } from "@/lib/supabase";
import { uploadWardrobeImage } from "@/lib/upload";

export default function AddItemModal() {
  async function onSubmit(values: ItemFormValues) {
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) throw userErr || new Error("Not signed in");
    if (values.images.length === 0) throw new Error("No images selected");

    // 1) Upload all selected images
    const uploadedPaths: string[] = [];
    console.log("Selected images:", values.images.length);
    console.log("Base64 present:", values.images.map((i) => !!i.base64));

    for (const img of values.images) {
      // base64 should be present because ItemForm uses base64: true
      if (!img.base64) {
        throw new Error("One of the selected images has no base64. Try selecting again.");
      }

      const uploaded = await uploadWardrobeImage({
        base64: img.base64,
        uri: img.uri, // used for ext hint
        userId: user.id,
      });

      uploadedPaths.push(uploaded.path);
    }

    // 2) Insert item (cover = first)
    const { data: item, error: insertErr } = await supabase
      .from("items")
      .insert({
        user_id: user.id,
        image_path: uploadedPaths[0],
        type: values.type,
        color: values.color || null,
        brand: values.brand || null,
      })
      .select("id")
      .single();

    if (insertErr) throw insertErr;

    // 3) Insert item_photos rows
    const photoRows = uploadedPaths.map((path, idx) => ({
      item_id: item.id,
      image_path: path,
      sort_order: idx,
    }));

    const { error: photosErr } = await supabase.from("item_photos").insert(photoRows);
    if (photosErr) {
      console.log("item_photos insert error:", photosErr);
      throw photosErr;
    }
    console.log("Inserted item_photos rows:", photoRows.length);
    router.back();
  }
  
  return (
    <>
      <Stack.Screen options={{ title: "Add item" }} />
      <Screen>
        <Title>Add item</Title>
        <Body style={{ marginTop: 8 }}>Upload photos and tag it so Ward can sort it.</Body>

        <ItemForm
          submitLabel="Save item"
          onDiscard={() => router.back()}
          onSubmit={async (v) => {
            try {
              await onSubmit(v);
            } catch (e: any) {
              Alert.alert("Upload failed", e?.message ?? "Unknown error");
            }
          }}
        />
      </Screen>
    </>
  );
}
