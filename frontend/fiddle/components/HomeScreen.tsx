import React from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView, Image } from "react-native";
import { useRouter, Link } from "expo-router";
import Colors from "@/constants/Colors";
import useClickSound from "@/hooks/useClickSound";

export default function HomeScreen() {
  const router = useRouter();
  const playClick = useClickSound();

  return (
    <View style={styles.screen}>
      <View style={styles.cardOuter}>
        <View style={styles.cardInner}>
          {/* Fiddle Sticker */}
          <Image
            source={require("../assets/bg/bg-logo-design.png")}
            style={styles.sticker}
            resizeMode="contain"
          />
          {/* Button row: Start (song selection) and Leaderboard */}
          <View style={styles.buttonCol}>
            <Link href="/leaderboard">
            </Link>
            <Pressable
                onPress={() => {playClick(); router.push("/song-selection")}}
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
              onPress={() => {playClick(); router.push("/leaderboard")}}
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
      </View>
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
    position: "relative", // allow the sticker to be absolutely positioned within this container
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
    top: -70, // negative to overlap the border — tweak as needed
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