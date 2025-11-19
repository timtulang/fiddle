import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  ImageBackground,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Audio, Video, ResizeMode } from "expo-av";
import songsConfig from "../assets/song_config.json";
import useClickSound from "@/hooks/useClickSound";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PANEL_IMAGES = [
  require("../assets/panel/song-1.png"),
  require("../assets/panel/song-2.png"),
  require("../assets/panel/song-3.png"),
];

export default function SongSelectionScreen() {
  const playClick = useClickSound();
  const router = useRouter();
  const allSongs = songsConfig.songs;
  const [startIndex, setStartIndex] = useState(0);

  // --- AUDIO: Play Background Music ---
  useFocusEffect(
    useCallback(() => {
      let soundObject: Audio.Sound | null = null;

      async function playBGM() {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require("../assets/audio/song_select_bgm.mp3"),
            { isLooping: true, volume: 0.5 }
          );
          soundObject = sound;
          await sound.playAsync();
        } catch (error) {
          console.warn("Error playing Song Select BGM:", error);
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

  // --- LOGIC: Visible Songs ---
  const visibleSongs = useMemo(() => {
    return [
      allSongs[(startIndex + 0) % allSongs.length],
      allSongs[(startIndex + 1) % allSongs.length],
      allSongs[(startIndex + 2) % allSongs.length],
    ];
  }, [startIndex, allSongs]);

  const centerSongIndex = (startIndex + 1) % allSongs.length;

  // --- HANDLERS ---
  const rotateRight = () => {
    playClick();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStartIndex((i) => (i + 1) % allSongs.length);
  };

  const rotateLeft = () => {
    playClick();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    <View style={styles.container}>
      {/* 1. BACKGROUND VIDEO */}
      <Video
        source={require("../assets/bg/menu_bg.mp4")}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={true}
      />

      {/* 2. DARK OVERLAY (Heavier tint for UI visibility) */}
      <View style={styles.overlay} />

      {/* 3. CONTENT LAYER */}
      <View style={styles.contentContainer}>
        {/* Back Button */}
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            playClick();
            router.back();
          }}
        >
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
            const panelPosition = idx; // 0=Left, 1=Center, 2=Right
            const isCenter = panelPosition === 1;
            const bgSource =
              PANEL_IMAGES[(startIndex + idx) % PANEL_IMAGES.length];

            return (
              <ImageBackground
                key={`panel-${startIndex}-${idx}`}
                source={bgSource}
                style={[
                  styles.panel,
                  panelPosition === 0 && styles.panelLeft,
                  panelPosition === 1 && styles.panelCenter,
                  panelPosition === 2 && styles.panelRight,
                  isCenter && styles.panelActive,
                ]}
                imageStyle={{ resizeMode: "stretch", borderRadius: 12 }}
              >
                {/* Inner Scrim for Text */}
                <View
                  style={[
                    styles.panelScrim,
                    {
                      backgroundColor: isCenter
                        ? "rgba(0,0,0,0.25)"
                        : "rgba(0,0,0,0.6)", // Very dark on sides to focus center
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

        {/* Footer Controls */}
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
    </View>
  );
}

const PANEL_WIDTH = 220;
const PANEL_HEIGHT = 220;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black", // Fallback color
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)", // 65% Opacity Black Overlay
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    zIndex: 2, // Sits on top of video + overlay
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 15,
  },

  // --- UI Elements ---
  backBtn: {
    position: "absolute",
    top: 30,
    left: 24,
    width: 48,
    height: 48,
    zIndex: 20,
  },
  iconBtn: { width: "100%", height: "100%" },
  titleImage: {
    width: 320,
    height: 70,
    marginTop: 10,
    marginBottom: 10,
    zIndex: 10,
  },
  carouselRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: PANEL_HEIGHT + 10,
    gap: 18,
    zIndex: 10,
  },
  panel: {
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  panelScrim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  panelContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  // Transforms
  panelLeft: {
    transform: [{ perspective: 800 }, { rotateY: "30deg" }, { scale: 0.85 }],
    opacity: 0.8,
  },
  panelCenter: {
    transform: [
      { perspective: 800 },
      { rotateY: "0deg" },
      { scale: 1.05 },
      { translateY: 0 },
    ],
    opacity: 1,
    zIndex: 20,
    borderColor: "#FFD700",
    borderWidth: 2,
    borderRadius: 14,
  },
  panelRight: {
    transform: [{ perspective: 800 }, { rotateY: "-30deg" }, { scale: 0.85 }],
    opacity: 0.8,
  },
  panelActive: {
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 4,
    marginBottom: 2,
  },
  songAuthor: {
    fontSize: 20,
    color: "#fbbf24",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 3,
    fontFamily: "JustAnotherHand",
  },
  metaBox: {
    marginTop: "auto",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignSelf: "flex-start",
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4ade80",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaTime: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "JustAnotherHand",
  },
  footerRow: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    zIndex: 20,
  },
  sideBtn: {
    width: 80,
    height: 60,
  },
  navIcon: { width: "100%", height: "100%" },
  playWrapper: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scale: 1.1 }],
  },
  playImage: {
    width: 200,
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