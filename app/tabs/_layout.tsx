import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="wardrobe" options={{ title: "Wardrobe" }} />
      <Tabs.Screen name="outfits" options={{ title: "Outfits" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />

      {/* ✅ Hide the details route so it doesn't appear in the bottom tab bar */}
      <Tabs.Screen name="wardrobe/[id]" options={{ href: null }} />
    </Tabs>
  );
}
