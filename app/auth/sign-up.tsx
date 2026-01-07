import { router, Stack } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSignUp() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
  
    if (error) return Alert.alert("Sign up failed", error.message);
  
    // If email confirmation is ON, there is no session yet
    if (!data.session) {
      Alert.alert(
        "Check your email",
        "We sent you a confirmation link. Confirm your email, then come back and sign in."
      );
      router.replace("/auth/sign-in");
      return;
    }
  
    // If confirmation is OFF, you get a session immediately
    router.replace("/tabs/wardrobe");
  }
  

  return (
    <>
      <Stack.Screen options={{ title: "Sign up" }} />
      <View style={{ flex: 1, backgroundColor: "#FAFAFA", padding: 24, justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#111" }}>Create account</Text>

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
          placeholder="Password (min 6)"
          secureTextEntry
          style={{ marginTop: 12, backgroundColor: "#F1F1F1", padding: 14, borderRadius: 12 }}
        />

        <TouchableOpacity
          onPress={onSignUp}
          disabled={loading}
          style={{ marginTop: 16, backgroundColor: "#EFEFEF", paddingVertical: 16, borderRadius: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#111", fontSize: 16, fontWeight: "600" }}>
            {loading ? "Creating..." : "Sign up"}
          </Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 18, textAlign: "center", color: "#777" }}>
          Already have an account?{" "}
          <Text style={{ color: "#111", fontWeight: "600" }} onPress={() => router.back()}>
            Sign in
          </Text>
        </Text>
      </View>
    </>
  );
}
