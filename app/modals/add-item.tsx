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

    if (!values.images || values.images.length === 0) {
      throw new Error("No images selected");
    }

    // Cover image is first
    const cover = values.images[0];

    const uploadedCover = await uploadWardrobeImage({
      base64: cover.base64,
      uri: cover.uri,
      userId: user.id,
    });

    const { error: insertErr } = await supabase.from("items").insert({
      user_id: user.id,
      image_path: uploadedCover.path,
      type: values.type,
      color: values.color || null,
      brand: values.brand || null,
    });

    if (insertErr) throw insertErr;

    // Later: upload the rest into item_photos table (proper multi-photo persistence)
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: "Add item" }} />
      <Screen>
        <Title>Add item</Title>
        <Body style={{ marginTop: 8 }}>Upload a photo and tag it so Ward can sort it.</Body>

        <ItemForm
          submitLabel="Save item"
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
