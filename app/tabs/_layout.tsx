import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="wardrobe" options={{ title: "Wardrobe" }} />
      <Tabs.Screen name="outfits" options={{ title: "Outfits" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />

      <Tabs.Screen name="wardrobe/[id]" options={{ href: null }} />
    </Tabs>
  );
}
