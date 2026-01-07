import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Title } from "@/components/ui/Typography";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { Alert, View } from "react-native";

export default function Profile() {
  async function onSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // Replace so user cannot go back
    router.replace("/");
  }

  return (
    <Screen>
      <Title>Profile</Title>

      <View style={{ marginTop: 32 }}>
        <Button label="Sign out" onPress={onSignOut} />
      </View>
    </Screen>
  );
}
