import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Image, Text, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Body } from "@/components/ui/Typography";
import { theme } from "@/lib/theme";

const TYPES = ["Top", "Bottom", "Shoes", "Outerwear", "Accessory"] as const;
export type ItemType = (typeof TYPES)[number];

export type PickedImage = { uri: string; base64?: string };

export type ItemFormValues = {
  images: PickedImage[];
  type: ItemType;
  color: string;
  brand: string;
};

export function ItemForm(props: {
  initialValues?: Partial<ItemFormValues>;
  submitLabel: string;
  onSubmit: (values: ItemFormValues) => Promise<void>;
}) {
  const [images, setImages] = useState<PickedImage[]>(props.initialValues?.images ?? []);
  const [type, setType] = useState<ItemType>(props.initialValues?.type ?? "Top");
  const [color, setColor] = useState(props.initialValues?.color ?? "");
  const [brand, setBrand] = useState(props.initialValues?.brand ?? "");
  const [saving, setSaving] = useState(false);

  // Sync when initialValues load/change (important for edit screen)
  useEffect(() => {
    if (!props.initialValues) return;
    if (props.initialValues.images !== undefined) setImages(props.initialValues.images ?? []);
    if (props.initialValues.type !== undefined) setType(props.initialValues.type);
    if (props.initialValues.color !== undefined) setColor(props.initialValues.color);
    if (props.initialValues.brand !== undefined) setBrand(props.initialValues.brand);
  }, [props.initialValues]);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      base64: true,
      allowsMultipleSelection: true,
      selectionLimit: 0,
    });

    if (!result.canceled) {
      const next = result.assets.map((asset) => ({
        uri: asset.uri,
        base64: asset.base64 ?? undefined,
      }));
      setImages((prev) => [...prev, ...next]);
    }
  }

  async function submit() {
    if (images.length === 0) {
      return Alert.alert("Missing photo", "Pick at least one photo.");
    }

    setSaving(true);
    try {
      await props.onSubmit({
        images,
        type,
        color,
        brand,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Photos */}
      <View style={{ marginTop: 18 }}>
        <Button label={images.length > 0 ? "Add another photo" : "Pick photo"} onPress={pickImage} />

        {images.length === 0 ? (
          <View
            style={{
              marginTop: 12,
              height: 180,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Body style={{ color: theme.colors.textTertiary }}>No photos yet</Body>
          </View>
        ) : (
          <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
            {images.map((img, idx) => (
              <Image
                key={`${img.uri}-${idx}`}
                source={{ uri: img.uri }}
                style={{
                  width: idx === 0 ? 180 : 120, // first = cover
                  height: 180,
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.colors.surface,
                }}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </View>

      {/* Type */}
      <View style={{ marginTop: 18 }}>
        <Body style={{ marginBottom: 8, color: theme.colors.text }}>Type</Body>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {TYPES.map((t) => (
            <Text
              key={t}
              onPress={() => setType(t)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: t === type ? theme.colors.surface : theme.colors.bg,
                color: theme.colors.text,
                fontWeight: t === type ? "700" : "500",
              }}
            >
              {t}
            </Text>
          ))}
        </View>
      </View>

      {/* Color */}
      <View style={{ marginTop: 18 }}>
        <Body style={{ marginBottom: 6, color: theme.colors.text }}>Color (optional)</Body>
        <TextInput
          value={color}
          onChangeText={setColor}
          placeholder="e.g. Black"
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            padding: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        />
      </View>

      {/* Brand */}
      <View style={{ marginTop: 12 }}>
        <Body style={{ marginBottom: 6, color: theme.colors.text }}>Brand (optional)</Body>
        <TextInput
          value={brand}
          onChangeText={setBrand}
          placeholder="e.g. Uniqlo"
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            padding: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        />
      </View>

      {/* Save */}
      <View style={{ marginTop: 18 }}>
        <Button label={saving ? "Saving..." : props.submitLabel} onPress={submit} disabled={saving} />
      </View>
    </>
  );
}
