import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, SectionList, Text, View } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { Body, Title } from "../../components/ui/Typography";
import { supabase } from "../../lib/supabase";
import { theme } from "../../lib/theme";

type ItemRow = {
  id: string;
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

export default function Wardrobe() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function load() {
    
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });
      const { data: u } = await supabase.auth.getUser();
      console.log("AUTH USER:", u.user?.id);
      
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
  
    const nextItems = (data ?? []) as ItemRow[];
    setItems(nextItems);

    const ids = new Set(nextItems.map((i) => i.id));
    setImageUrls((prev) => {
      const next: Record<string, string> = {};
      for (const id of Object.keys(prev)) {
        if (ids.has(id)) next[id] = prev[id];
      }
      return next;
    });

    setSelected((prev) => {
      const next: Record<string, boolean> = {};
      for (const id of Object.keys(prev)) {
        if (ids.has(id) && prev[id]) next[id] = true;
      }
      return next;
    });
  }  

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );
  

  // Fetch signed URLs for images
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const missing = items.filter((i) => !imageUrls[i.id]);
      if (missing.length === 0) return;

      const pairs: Array<[string, string]> = [];
      for (const i of missing) {
        try {
          const url = await getSignedImageUrl(i.image_path);
          pairs.push([i.id, url]);
        } catch {
          // ignore per-item errors for now
        }
      }

      if (!cancelled) {
        setImageUrls((prev) => {
          const next = { ...prev };
          for (const [id, url] of pairs) next[id] = url;
          return next;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items, imageUrls]);

  const sections = useMemo(() => {
    const order = ["Top", "Bottom", "Shoes", "Outerwear", "Accessory"];
    const map = new Map<string, ItemRow[]>();
    for (const it of items) {
      const key = it.type || "Other";
      map.set(key, [...(map.get(key) || []), it]);
    }
    return order
      .filter((k) => map.has(k))
      .map((k) => ({ title: k, data: map.get(k)! }));
  }, [items]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const selecting = selectedIds.length > 0;

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <Screen padded={false}>
      <View style={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.sm }}>
        <Title>Wardrobe</Title>
        <Body style={{ marginTop: 6 }}>
          {selecting ? `${selectedIds.length} selected` : "Tap items to select for an outfit."}
        </Body>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Pressable
            onPress={() => router.push("/modals/add-item")}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "600" }}>+ Add item</Text>
          </Pressable>

          <Pressable
            disabled={!selecting}
            onPress={() => {
              // Next: create outfit from selectedIds
              Alert.alert("Next step", `Create outfit with: ${selectedIds.length} items`);
            }}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: theme.colors.border,
              opacity: selecting ? 1 : 0.4,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "600" }}>Create outfit</Text>
          </Pressable>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 0 }}
        renderSectionHeader={({ section }) => (
          <Text style={{ marginTop: 18, marginBottom: 10, color: theme.colors.text, fontSize: 16, fontWeight: "800" }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const url = imageUrls[item.id];
          const isSelected = !!selected[item.id];

          return (
            <Pressable
              onPress={() => {
                if (selecting) toggle(item.id);
                else router.push(`/tabs/wardrobe/${item.id}`);
              }}
              onLongPress={() => toggle(item.id)}
              delayLongPress={250}
              style={{
                marginBottom: 12,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.text : theme.colors.border,
                backgroundColor: theme.colors.surface,
                overflow: "hidden",
              }}
            >
              <View style={{ height: 180, backgroundColor: theme.colors.surface }}>
                {url ? (
                  <Image source={{ uri: url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : null}
              </View>
          
              <View style={{ padding: 12 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                  {item.brand || "Unbranded"} • {item.color || "No colour"}
                </Text>
                <Text style={{ color: theme.colors.textTertiary, marginTop: 4 }}>
                  {selecting ? "Tap to toggle" : "Tap to open • Long-press to select"}
                </Text>
              </View>
            </Pressable>
          );
          
        }}
        ListEmptyComponent={
          <View style={{ padding: theme.spacing.lg }}>
            <Body>No items yet. Add your first piece to start building outfits.</Body>
          </View>
        }
      />
    </Screen>
  );
}

