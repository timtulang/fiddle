// ...existing code...
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  Animated,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import songsConfig from "../assets/song_config.json";
import useClickSound from "@/hooks/useClickSound";

const PANEL_IMAGES = [
  require("../assets/panel/song-1.png"),
  require("../assets/panel/song-2.png"),
  require("../assets/panel/song-3.png"),
];

export default function SongSelectionScreen() {
  const playClick = useClickSound();
  const router = useRouter();
  const allSongs = songsConfig.songs;
  const [startIndex, setStartIndex] = useState(0); // index of left panel (first visible)

  const visibleSongs = useMemo(() => {
    return [
      allSongs[(startIndex + 0) % allSongs.length],
      allSongs[(startIndex + 1) % allSongs.length],
      allSongs[(startIndex + 2) % allSongs.length],
    ];
  }, [startIndex, allSongs]);

  const centerSongIndex = (startIndex + 1) % allSongs.length;

  // Placeholder image when song.image is missing
  const PLACEHOLDER_ALBUM = "https://picsum.photos/600/400?blur=4";

  const rotateRight = () => {
    // 1,2,3 -> 2,3,1 (advance)
    playClick();
    setStartIndex((i) => (i + 1) % allSongs.length);
  };

  const rotateLeft = () => {
    // inverse rotation
    playClick();
    setStartIndex((i) => (i - 1 + allSongs.length) % allSongs.length);
  };

  const handlePlay = () => {
    playClick();
    router.push({
      pathname: "/game",
      params: { songId: String(centerSongIndex) },
    });
  };

  return (
    <View style={styles.screen}>
      {/* Back Button */}
      <Pressable style={styles.backBtn} onPress={() => {playClick();router.back();}}>
        <Image
          source={require("../assets/btn/back_btn.png")}
          style={styles.iconBtn}
          resizeMode="contain"
        />
      </Pressable>

      {/* Title */}
      <Image
        source={require("../assets/bg/selection-title.png")}
        style={styles.titleImage}
        resizeMode="contain"
      />

      {/* Carousel */}
      <View style={styles.carouselRow}>
        {visibleSongs.map((song, idx) => {
          const panelPosition = idx; // 0 left, 1 center, 2 right
          const isCenter = panelPosition === 1;

          // Use song.image if present (expects a URI string), else placeholder
          const bgSource =
            PANEL_IMAGES[(startIndex + idx) % PANEL_IMAGES.length];

          return (
            <ImageBackground
              key={centerSongIndex + "-" + idx}
              source={bgSource}
              style={[
                styles.panel,
                panelPosition === 0 && styles.panelLeft,
                panelPosition === 1 && styles.panelCenter,
                panelPosition === 2 && styles.panelRight,
                isCenter && styles.panelActive,
              ]}
              imageStyle={styles.panelImage}
            >
              {/* Dark scrim to improve text legibility */}
              <View
                style={[
                  styles.panelScrim,
                  {
                    backgroundColor: isCenter
                      ? "rgba(0,0,0,0.25)"
                      : "rgba(0,0,0,0.4)",
                  },
                ]}
              />

              <View style={styles.panelContent}>
                <Text style={styles.songTitle} numberOfLines={2}>
                  {song.title}
                </Text>
                <Text style={styles.songAuthor}>{song.author}</Text>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>{song.difficulty}</Text>
                  <Text style={styles.metaTime}>
                    {Math.floor(song.song_duration / 60000)}:
                    {Math.floor((song.song_duration / 1000) % 60)
                      .toString()
                      .padStart(2, "0")}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          );
        })}
      </View>

      {/* Controls + Play */}
      <View style={styles.footerRow}>
        <Pressable onPress={rotateLeft} style={styles.sideBtn}>
          <Image
            source={require("../assets/btn/left_btn.png")}
            style={styles.navIcon}
            resizeMode="contain"
          />
        </Pressable>

        <TouchableOpacity onPress={handlePlay} style={styles.playWrapper}>
          <Image
            source={require("../assets/btn/white-bg-btn.png")}
            style={styles.playImage}
            resizeMode="stretch"
          />
          <Text style={styles.playText}>PLAY NOW</Text>
        </TouchableOpacity>

        <Pressable onPress={rotateRight} style={styles.sideBtn}>
          <Image
            source={require("../assets/btn/right_btn.png")}
            style={styles.navIcon}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </View>
  );
}

const PANEL_WIDTH = 220;
const PANEL_HEIGHT = 220;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#001F3F",
    paddingTop: 15,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 30,
    left: 24,
    width: 48,
    height: 48,
    zIndex: 10,
  },
  iconBtn: { width: "100%", height: "100%" },
  titleImage: {
    width: 320,
    height: 70,
  },
  carouselRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: PANEL_HEIGHT,
    marginTop: 0,
    gap: 18,
  },
  panel: {
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    overflow: "hidden", // ensure corners clip the background image
  },
  panelImage: {},
  panelScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  panelContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  panelLeft: {
    transform: [
      { perspective: 500 },
      { rotateY: "26deg" },
      { translateX: -10 },
      { scale: 0.9 },
    ],
    opacity: 0.9,
  },
  panelCenter: {
    transform: [
      { perspective: 500 },
      { rotateY: "0deg" },
      { rotateX: "6deg" }, // tilt back
      { scale: 0.85 }, // smaller = farther
      { translateY: -6 }, // lift slightly
    ],
    opacity: 0.9,
    zIndex: 1,
  },
  panelRight: {
    transform: [
      { perspective: 500 },
      { rotateY: "-26deg" },
      { translateX: 10 },
      { scale: 0.9 },
    ],
    opacity: 0.9,
  },
  panelActive: {
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4, // blend text further
  },
  songAuthor: {
    fontSize: 18,
    color: "#e2e8f0",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 3,
    fontFamily: "JustAnotherHand",
  },
  metaBox: {
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.35)", // translucent for blending
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4ade80",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  metaTime: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "JustAnotherHand",
  },
  footerRow: {
    position: "absolute",
    bottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },
  sideBtn: {
    width: 100,
    height: 70,
  },
  navIcon: { width: "100%", height: "100%" },
  playWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  playImage: {
    width: 220,
    height: 56,
    borderRadius: 12,
  },
  playText: {
    position: "absolute",
    fontSize: 32,
    fontWeight: "600",
    color: "#1e3a8a",
    letterSpacing: 1,
    fontFamily: "JustAnotherHand",
  },
});