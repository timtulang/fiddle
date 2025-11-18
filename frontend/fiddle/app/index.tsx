import React, { useEffect } from "react";
import { View, Image, StyleSheet, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "@/components/HomeScreen";
import Colors from "@/constants/Colors";
import * as ScreenOrientation from "expo-screen-orientation";

export default function IndexRoute() {

  // Landscape Lock
  useEffect(() => {
    async function lockToLandscape() {
      try {
        // We use LANDSCAPE to allow both left and right landscape views
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        console.log("Screen orientation locked to Landscape.");
      } catch (error) {
        console.error("Failed to lock screen orientation:", error);
      }
    }

    lockToLandscape();
  })

  return (
    <SafeAreaProvider style={styles.safe}>
      {/* Hide Status Bar */}
      <StatusBar hidden={true} />

      {/* Floor Design */}
      <Image
        source={require("../assets/bg/bg-floor-design.png")}
        style={styles.bgFloor}
        resizeMode="cover"
      />
      {/* Home */}
      <HomeScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  bgFloor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: 400,
    zIndex: 0,
  },
});
