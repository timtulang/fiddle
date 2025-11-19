import React, { useCallback, useEffect } from "react";
import { StyleSheet, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "@/components/HomeScreen";
import Colors from "@/constants/Colors";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio, Video, ResizeMode } from "expo-av"; // Import Video & ResizeMode
import { useFocusEffect } from "expo-router";

export default function IndexRoute() {

  // 1. Landscape Lock
  useEffect(() => {
    async function lockToLandscape() {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch (error) {
        console.error("Failed to lock screen orientation:", error);
      }
    }
    lockToLandscape();
  }, []);

  // 2. Background Music Logic
  useFocusEffect(
    useCallback(() => {
      let soundObject: Audio.Sound | null = null;

      async function playBGM() {
        try {
          const { sound } = await Audio.Sound.createAsync(
             require("../assets/audio/home_bgm.mp3"), 
            { isLooping: true, volume: 0.5 }
          );
          
          soundObject = sound;
          await sound.playAsync();
        } catch (error) {
          console.log("Error playing Home BGM:", error);
        }
      }

      playBGM();

      return () => {
        if (soundObject) {
          soundObject.stopAsync();
          soundObject.unloadAsync();
        }
      };
    }, [])
  );

  return (
    <SafeAreaProvider style={styles.safe}>
      <StatusBar hidden={true} />

      {/* REPLACED IMAGE WITH VIDEO */}
      <Video
        source={require("../assets/bg/menu_bg.mp4")} // Make sure this file exists!
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={true} // Mute video to save resources/prevent clashes
      />
      

      <HomeScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
    height: "100%",
    zIndex: 0, // Behind everything
  },
});