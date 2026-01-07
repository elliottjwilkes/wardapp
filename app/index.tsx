import { Stack, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View
      style={{
        flex: 1,
        backgroundColor: "#FAFAFA", // soft off-white
        padding: 24,
        justifyContent: "space-between",
      }}
    >
      {/* Top section */}
      <View style={{ marginTop: 80 }}>
        <Text
          style={{
            fontSize: 42,
            fontWeight: "800",
            color: "#111", // soft black, not pure
          }}
        >
          Ward
        </Text>

        <Text
          style={{
            fontSize: 18,
            color: "#666", // gentle grey
            marginTop: 12,
            lineHeight: 26,
          }}
        >
          Your virtual wardrobe.
          {"\n"}Try outfits before you buy.
        </Text>
      </View>

      {/* Bottom section */}
      <TouchableOpacity
  onPress={() => router.push("/auth/sign-up")}
  style={{
    backgroundColor: "#EFEFEF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  }}
>
  <Text style={{ color: "#111", fontSize: 16, fontWeight: "600" }}>
    Get started
  </Text>
</TouchableOpacity>

        <Text
          style={{
            textAlign: "center",
            marginTop: 18,
            color: "#777",
            fontSize: 14,
          }}
        >
          Already have an account?{" "}
          <Text
            style={{ color: "#111", fontWeight: "500" }}
            onPress={() => router.push("/auth/sign-in")}
          >
          Sign in
          </Text>
        </Text>
      </View>
    </>
  );
}
