import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

import { ItemForm, ItemFormValues, PickedImage } from "@/components/items/ItemForm";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Body, Title } from "@/components/ui/Typography";
import { supabase } from "@/lib/supabase";
import { uploadWardrobeImage } from "@/lib/upload";

type ItemRow = {
  id: string;
  user_id: string;
  image_path: string;
  type: string;
  color: string | null;
  brand: string | null;
  created_at: string;
};

async function getSignedImageUrl(path: string) {
  const { data, error } = await supabase.storage.from("wardrobe").createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export default function ItemDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<ItemRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  async function load() {
    if (!id) return;

    setLoading(true);

    // 1) Load the item row
    const { data, error } = await supabase
      .from("items")
      .select("id,user_id,image_path,type,color,brand,created_at")
      .eq("id", id)
      .single();

    if (error) {
      setLoading(false);
      Alert.alert("Error loading item", error.message);
      return;
    }

    const row = data as ItemRow;
    setItem(row);

    // 2) Load item_photos for this item
    const { data: photos, error: photosErr } = await supabase
      .from("item_photos")
      .select("image_path, sort_order")
      .eq("item_id", row.id)
      .order("sort_order");

    if (photosErr) {
      console.log("photos load error", photosErr);
      setPhotoUrls([]);
    } else {
      try {
        const signedUrls = await Promise.all((photos ?? []).map((p) => getSignedImageUrl(p.image_path)));
        setPhotoUrls(signedUrls);
      } catch (e: any) {
        console.log("sign url error", e?.message ?? e);
        setPhotoUrls([]);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  // ✅ Use photoUrls (all photos), not coverUrl
  const initialValues = useMemo(() => {
    if (!item) return undefined;

    const images: PickedImage[] =
      photoUrls.length > 0 ? photoUrls.map((uri) => ({ uri })) : [];

    return {
      images,
      type: item.type as any,
      color: item.color ?? "",
      brand: item.brand ?? "",
    };
  }, [item, photoUrls]);

  async function onSubmit(values: ItemFormValues) {
    if (!item) return;

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) throw userErr || new Error("Not signed in");

    // NEW images are those with base64 (picked just now)
    const newOnes = values.images.filter((img) => !!img.base64);

    // Upload new images
    const newPaths: string[] = [];
    for (const img of newOnes) {
      if (!img.base64) continue;
      const uploaded = await uploadWardrobeImage({
        base64: img.base64,
        uri: img.uri,
        userId: user.id,
      });
      newPaths.push(uploaded.path);
    }

    // If new images were added, append them to item_photos
    if (newPaths.length > 0) {
      // find next sort_order
      const { data: existing } = await supabase
        .from("item_photos")
        .select("sort_order")
        .eq("item_id", item.id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const startOrder = existing?.[0]?.sort_order ?? -1;

      const rows = newPaths.map((path, idx) => ({
        item_id: item.id,
        image_path: path,
        sort_order: startOrder + 1 + idx,
      }));

      const { error: photosErr } = await supabase.from("item_photos").insert(rows);
      if (photosErr) throw photosErr;

      // also set cover to the first image if there wasn't one, OR if you want "latest becomes cover"
      // Here: if user added new images, we set cover to the first new one
      const { error: coverErr } = await supabase
        .from("items")
        .update({ image_path: newPaths[0] })
        .eq("id", item.id);

      if (coverErr) throw coverErr;
    }

    // Update metadata
    const { error: updateErr } = await supabase
      .from("items")
      .update({
        type: values.type,
        color: values.color || null,
        brand: values.brand || null,
      })
      .eq("id", item.id);

    if (updateErr) throw updateErr;

    router.back();
  }

  async function deleteItem() {
    if (!item) return;

    Alert.alert("Delete item?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("items").delete().eq("id", item.id);
          if (error) Alert.alert("Delete failed", error.message);
          else router.back();
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Title>Edit item</Title>
        <Body style={{ marginTop: 8 }}>
          {loading ? "Loading..." : "Update photos and metadata."}
        </Body>

        {item && initialValues ? (
          <ItemForm
            initialValues={initialValues}
            submitLabel="Save changes"
            onDiscard={() => router.back()}
            onSubmit={async (v) => {
              try {
                await onSubmit(v);
              } catch (e: any) {
                Alert.alert("Save failed", e?.message ?? "Unknown error");
              }
            }}
          />
        ) : null}

        {item ? (
          <View style={{ marginTop: 14 }}>
            <Button label="Delete item" onPress={deleteItem} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
