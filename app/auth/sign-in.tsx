import { router, Stack } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) return Alert.alert("Sign in failed", error.message);
    router.replace("/tabs/wardrobe");
  }

  return (
    <>
      <Stack.Screen options={{ title: "Sign in" }} />
      <View style={{ flex: 1, backgroundColor: "#FAFAFA", padding: 24, justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#111" }}>Welcome back</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          style={{ marginTop: 18, backgroundColor: "#F1F1F1", padding: 14, borderRadius: 12 }}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={{ marginTop: 12, backgroundColor: "#F1F1F1", padding: 14, borderRadius: 12 }}
        />

        <TouchableOpacity
          onPress={onSignIn}
          disabled={loading}
          style={{ marginTop: 16, backgroundColor: "#EFEFEF", paddingVertical: 16, borderRadius: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#111", fontSize: 16, fontWeight: "600" }}>
            {loading ? "Signing in..." : "Sign in"}
          </Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 18, textAlign: "center", color: "#777" }}>
          No account?{" "}
          <Text style={{ color: "#111", fontWeight: "600" }} onPress={() => router.push("/auth/sign-up")}>
            Sign up
          </Text>
        </Text>
      </View>
    </>
  );
}
