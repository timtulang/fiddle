import { Stack } from "expo-router";
import { Text, TextInput } from "react-native";
import { useFonts } from "expo-font";
export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    JustAnotherHand: require("../assets/fonts/JustAnotherHand-Regular.ttf"),
  });

  // Wait for font load to avoid flicker
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}