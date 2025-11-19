import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from "react-native";
import { useRouter, Link } from "expo-router";
import useClickSound from "@/hooks/useClickSound";

export default function HomeScreen() {
  const router = useRouter();
  const playClick = useClickSound();

  // --- ANIMATION VALUES ---
  // 1. Scale value for the Card Entrance (starts at 0.9, goes to 1)
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // 2. Float value for the Sticker (up and down loop)
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // A. Entrance Animation (Card pops in)
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // B. Loop Animation (Sticker floats)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10, // Move up 10 pixels
          duration: 1500,
          easing: Easing.inOut(Easing.sin), // Smooth sine wave
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, // Move back down
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.screen}>
      {/* Animated Wrapper for the whole card entrance */}
      <Animated.View
        style={[
          styles.cardOuter,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.cardInner}>
          {/* Fiddle Sticker with Floating Animation */}
          <Animated.Image
            source={require("../assets/bg/bg-logo-design.png")}
            style={[
              styles.sticker,
              { transform: [{ translateY: floatAnim }] }, // Bind translateY to floatAnim
            ]}
            resizeMode="contain"
          />
          
          {/* Button row: Start (song selection) and Leaderboard */}
          <View style={styles.buttonCol}>
            {/* Removed Empty Link wrapper as it wasn't wrapping anything visual */}
            
            <Pressable
              onPress={() => {
                playClick();
                router.push("/song-selection");
              }}
              style={({ pressed }) => [
                styles.imageButtonWrapper,
                pressed ? styles.imageButtonPressed : undefined,
              ]}
              accessibilityLabel="Start - Song selection"
            >
              <Image
                source={require("../assets/btn/start-btn.png")}
                style={styles.imageButton}
                resizeMode="contain"
              />
            </Pressable>

            <Pressable
              onPress={() => {
                playClick();
                router.push("/leaderboard");
              }}
              style={({ pressed }) => [
                styles.imageButtonWrapper,
                pressed ? styles.imageButtonPressed : undefined,
              ]}
              accessibilityLabel="Leaderboard"
            >
              <Image
                source={require("../assets/btn/leaderboard-btn.png")}
                style={styles.imageButton}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Outer white rounded background (the "card")
  cardOuter: {
    width: "85%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: "#fff",
    // give subtle shadow on native platforms
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 18,
    position: "relative",
  },
  // Inner container that creates the gap + black border
  cardInner: {
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "#312B2B",
    paddingVertical: 28,
    // paddingHorizontal: 20,
    alignItems: "center",
  },
  sticker: {
    position: "absolute",
    top: -70, 
    alignSelf: "center",
    width: 300,
    height: 140,
    zIndex: 10,
  },

  // Centered horizontal row for the buttons
  buttonCol: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 6,
    alignItems: "center",
    marginTop: 12,
  },

  // Pressable wrapper so we can show pressed state
  imageButtonWrapper: {
    borderRadius: 12,
    marginHorizontal: 10,
  },
  imageButton: {
    width: 230,
    height: 60,
  },
  imageButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});