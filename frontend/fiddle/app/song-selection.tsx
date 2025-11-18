import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";

// try to load your song config; fallback to inline list if unavailable
const SONGS = (require("../assets/song_config.json") as {
  title?: string;
  artist?: string;
}[]) || [
  { title: "Song A", artist: "Artist 1" },
  { title: "Song B", artist: "Artist 2" },
  { title: "Song C", artist: "Artist 3" },
];

export default function SongSelection() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const total = SONGS.length;

  function prev() {
    setIndex((i) => (i - 1 + total) % total);
  }
  function next() {
    setIndex((i) => (i + 1) % total);
  }
  function playNow() {
    // navigate to your player/test route — change as needed
    router.push("/test");
  }
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={styles.cardOuter}>
          <View style={styles.cardInner}>
            {/* song panel */}
            <View style={styles.panel}>
              {/* left arrow */}
              <Pressable onPress={prev} style={styles.sideBtn}>
                <Text style={styles.sideBtnText}>‹</Text>
              </Pressable>

              {/* center info */}
              <View style={styles.info}>
                {/* optional artwork: adjust or add image asset per song if available */}
                <View style={styles.artworkPlaceholder}>
                  <Text style={styles.artworkText}>Artwork</Text>
                </View>
                <Text style={styles.songTitle}>
                  {SONGS[index]?.title ?? "Unknown"}
                </Text>
                <Text style={styles.songArtist}>
                  {SONGS[index]?.artist ?? ""}
                </Text>
              </View>

              {/* right arrow */}
              <Pressable onPress={next} style={styles.sideBtn}>
                <Text style={styles.sideBtnText}>›</Text>
              </Pressable>
            </View>

            {/* play button */}
            <Pressable
              onPress={playNow}
              style={({ pressed }) => [
                styles.playBtn,
                pressed && styles.playBtnPressed,
              ]}
            >
              <Text style={styles.playBtnText}>Play Now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const WIDTH = Math.min(Dimensions.get("window").width, 520);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.background },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },

  backBtn: { position: "absolute", left: 12, top: 12, zIndex: 20, padding: 8 },
  backText: { color: "#fff", fontSize: 22 },

  // card (matches HomeScreen)
  cardOuter: {
    width: "90%",
    maxWidth: WIDTH,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 18,
    position: "relative",
  },
  cardInner: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#312B2B",
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  panel: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
  },
  sideBtnText: { fontSize: 28, color: "#222" },

  info: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  artworkPlaceholder: {
    width: 160,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  artworkText: { color: "#666" },
  songTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  songArtist: { color: "#666", marginTop: 4 },

  playBtn: {
    marginTop: 18,
    backgroundColor: Colors.dark.tint,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 12,
  },
  playBtnPressed: { opacity: 0.9 },
  playBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});