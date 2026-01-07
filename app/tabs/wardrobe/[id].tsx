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
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("id,user_id,image_path,type,color,brand,created_at")
      .eq("id", id)
      .single();

    setLoading(false);

    if (error) {
      Alert.alert("Error loading item", error.message);
      return;
    }

    const row = data as ItemRow;
    setItem(row);

    try {
      const signed = await getSignedImageUrl(row.image_path);
      setCoverUrl(signed);
    } catch {
      setCoverUrl(null);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const initialValues = useMemo(() => {
    if (!item) return undefined;

    const images: PickedImage[] = coverUrl ? [{ uri: coverUrl }] : [];

    return {
      images,
      type: item.type as any,
      color: item.color ?? "",
      brand: item.brand ?? "",
    };
  }, [item, coverUrl]);

  async function onSubmit(values: ItemFormValues) {
    if (!item) return;

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) throw userErr || new Error("Not signed in");

    // Upload only NEW images (local URIs, not signed URLs)
    const newOnes = values.images.filter((img) => !img.uri.startsWith("http"));

    let newCoverPath: string | null = null;

    if (newOnes.length > 0) {
      const uploaded = await uploadWardrobeImage({
        base64: newOnes[0].base64,
        uri: newOnes[0].uri,
        userId: user.id,
      });

      newCoverPath = uploaded.path;

      // Later: upload remaining photos into item_photos table
      // for (const img of newOnes.slice(1)) { ... }
    }

    const { error: updateErr } = await supabase
      .from("items")
      .update({
        type: values.type,
        color: values.color || null,
        brand: values.brand || null,
        ...(newCoverPath ? { image_path: newCoverPath } : {}),
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
    <>
      <Screen>
  <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
    <Title>Edit item</Title>
    <Body style={{ marginTop: 8 }}>
      {loading ? "Loading..." : "Update photo and metadata."}
    </Body>

    {item && initialValues ? (
      <ItemForm
        initialValues={initialValues}
        submitLabel="Save changes"
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

    </>
  );
}
