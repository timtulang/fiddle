import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import type { CameraView as CameraViewType } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import songsConfig from '../assets/song_config.json';
import { useLocalSearchParams, useRouter } from "expo-router";
import useClickSound from '@/hooks/useClickSound';
import FinishScreen from '@/components/FinishScreen';

// REPLACE WITH YOUR IP
const SERVER_IP = '192.168.1.100'; 
const API_URL = `http://${SERVER_IP}:8000/process-image`;

// Link the 'var_name' from JSON to local MP3 files here.
const AUDIO_MAP: Record<string, any> = {
  //'var_name': require('./assets/audio/song1.mp3'),
  'you_belong_w_me': require("../assets/audio/youbelongwme.mp3"),
  'wonderful_world': require("../assets/audio/wonderful_world.mp3"),
  'count_on_me': require("../assets/audio/count_on_me.mp3"),

  // Fallback if var_name doesn't exist
  default: {
    uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
};

// Link the 'asl' text to local Image files here.
const GESTURE_IMAGES: Record<string, any> = {
  A: require("../assets/asl/A.png"),
  B: require("../assets/asl/B.png"),
  C: require("../assets/asl/C.png"),
  D: require("../assets/asl/D.png"),
  E: require("../assets/asl/E.png"),
  F: require("../assets/asl/F.png"),
  G: require("../assets/asl/G.png"),
  H: require("../assets/asl/H.png"),
  I: require("../assets/asl/I.png"),
  K: require("../assets/asl/K.png"),
  L: require("../assets/asl/L.png"),
  M: require("../assets/asl/M.png"),
  N: require("../assets/asl/N.png"),
  O: require("../assets/asl/O.png"),
  P: require("../assets/asl/P.png"),
  Q: require("../assets/asl/Q.png"),
  R: require("../assets/asl/R.png"),
  S: require("../assets/asl/S.png"),
  T: require("../assets/asl/T.png"),
  U: require("../assets/asl/U.png"),
  V: require("../assets/asl/V.png"),
  W: require("../assets/asl/W.png"),
  X: require("../assets/asl/X.png"),
  Y: require("../assets/asl/Y.png"),
};

// --- CONSTANTS ---
const OFFSETS = { EARLY: -450, PERFECT: 0, LATE: 450 };
const SCROLL_SPEED = 0.15; 
const TARGET_ZONE_X = 150;

// --- HELPERS ---
const parseTimeToMillis = (timeStr: string): number => {
  const parts = timeStr.split(':');
  const min = parseInt(parts[0], 10);
  const sec = parseFloat(parts[1]);
  return (min * 60 + sec) * 1000;
};

const formatTime = (millis: number) => {
  if (millis < 0) return "0:00";
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

type GameLyricLine = {
  time: string;
  text: string;
  gesture: string;
  prompt: string;
  parsedTime: number; 
  processed: boolean;
  shotsTaken: { early: boolean; perfect: boolean; late: boolean };
  result: 'PERFECT' | 'GREAT' | 'MISS' | null;
};

export default function GameScreen() {
  const playClick = useClickSound();

  // 1. GET THE SONG ID
  const router = useRouter();
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const safeSongId = songId ?? "0";

  // 2. LOAD DATA DYNAMICALLY
  const songData = songsConfig.songs[parseInt(safeSongId)];

  const { gameLyrics, songDuration } = useMemo(() => {
    const rawEntries = songData.entries;
    const lastTime = parseTimeToMillis(
      rawEntries[rawEntries.length - 1].timestamp
    );
    // Add 5 seconds buffer at the end
    const duration = lastTime + 5000;

    const processedLyrics: GameLyricLine[] = rawEntries.map((entry: any) => ({
      time: entry.timestamp,
      text: entry.lyric,
      gesture: entry.asl,
      prompt: entry.prompt,
      parsedTime: parseTimeToMillis(entry.timestamp),
      processed: false,
      shotsTaken: { early: false, perfect: false, late: false },
      result: null,
    }));

    return { gameLyrics: processedLyrics, songDuration: duration };
  }, [songData]);

  // --- STATE ---
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraViewType>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const gameTimeAnim = useRef(new Animated.Value(0)).current;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  // SAFETY REF: Tracks game state immediately to prevent async camera calls
  const isGameOverRef = useRef(false); 
  
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [displayTime, setDisplayTime] = useState("0:00");

  // --- AUDIO SETUP ---
  useEffect(() => {
    if (!permission?.granted) return;

    async function loadAndPlaySound() {
      try {
        // We look for the song's 'var_name' in our map.
        let audioSource = AUDIO_MAP[songData.var_name];

        if (!audioSource) {
          console.warn(
            `Audio for ${songData.var_name} not found in map. Using default.`
          );
          audioSource = AUDIO_MAP["default"];
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          audioSource,
          {
            shouldPlay: true,
            isLooping: false,
          }
        );

        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);
        isGameOverRef.current = false; // Reset ref on start

       // Observe playback end reliably
       newSound.setOnPlaybackStatusUpdate((status: any) => {
         if (!status.isLoaded) return;
         if (status.didJustFinish) {
           console.log("[Game] didJustFinish -> setIsGameOver(true)");
           // Mark ref immediately to stop camera operations
           isGameOverRef.current = true; 
           setIsGameOver(true);
           setIsPlaying(false);
         }
       });

        Animated.timing(gameTimeAnim, {
          toValue: songDuration,
          duration: songDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Error loading sound", error);
        Alert.alert("Error", "Could not load audio file.");
      }
    }

    loadAndPlaySound();

    return () => {
      if (sound) sound.unloadAsync();
      gameTimeAnim.stopAnimation();
    };
  }, [permission, songData]); 

  // --- GAME LOOP ---
  useEffect(() => {
    if (!isPlaying || !sound || isGameOver) return;

    const interval = setInterval(async () => {
      const status = await sound.getStatusAsync();

      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        isGameOverRef.current = true;
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }

      const currentTime = status.positionMillis;

      // 🛑 Alternative Completion Check
      if (currentTime >= songDuration - 500) {
        console.log("Audio finished via status check! Ending game.");
        isGameOverRef.current = true;
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }

      setDisplayTime(formatTime(currentTime));

      gameLyrics.forEach((lyric, index) => {
        if (lyric.processed || !lyric.parsedTime) return;
        const diff = currentTime - lyric.parsedTime;

        if (
          diff >= OFFSETS.EARLY &&
          diff < OFFSETS.EARLY + 150 &&
          !lyric.shotsTaken?.early
        ) {
          lyric.shotsTaken!.early = true;
          captureAndEvaluate(lyric, "early");
        }
        if (
          diff >= OFFSETS.PERFECT &&
          diff < OFFSETS.PERFECT + 150 &&
          !lyric.shotsTaken?.perfect
        ) {
          lyric.shotsTaken!.perfect = true;
          captureAndEvaluate(lyric, "perfect");
        }
        if (diff >= OFFSETS.LATE) {
          if (!lyric.shotsTaken?.late) {
            lyric.shotsTaken!.late = true;
            captureAndEvaluate(lyric, "late");
          }
          if (diff > OFFSETS.LATE + 200 && !lyric.processed) {
            completeLyric(lyric);
          }
        }

        if (diff > -1000 && diff < 1000) {
          setCurrentLyricIndex(index);
        }
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, sound, isGameOver]);

  // --- LOGIC ---
  const completeLyric = (lyric: GameLyricLine) => {
    lyric.processed = true;
    if (lyric.result === "PERFECT") {
      setFeedback("PERFECT!!");
      setScore((s) => s + 100);
    } else if (lyric.result === "GREAT") {
      setFeedback("GREAT!");
      setScore((s) => s + 50);
    } else {
      setFeedback("MISS");
    }
    setTimeout(() => setFeedback(""), 1000);
  };

  const captureAndEvaluate = async (
    lyric: GameLyricLine,
    shotType: "early" | "perfect" | "late"
  ) => {
    // SAFETY CHECK: If game is over, do NOT access camera.
    if (!cameraRef.current || isGameOverRef.current) return;
    
    const targetGesture = lyric.gesture;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        base64: true,
        skipProcessing: true,
        shutterSound: false,
      });
      
      // Double check in case game ended while taking picture
      if (isGameOverRef.current) return;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64_image: photo?.base64 }),
      });
      const result = await response.json();
      if (result.gesture === targetGesture) {
        if (shotType === "perfect") {
          lyric.result = "PERFECT";
        } else if (lyric.result !== "PERFECT") {
          lyric.result = "GREAT";
        }
      }
    } catch (e) {
        // Silently fail if camera error (common during screen transitions)
    }
  };

  const handleExit = () => {
    if (sound) sound.stopAsync();
    playClick();
    router.back();
  };

  const handleHome = () => {
    playClick();
    router.push('/')
  }

  const handleSave = (name: string) => {
    playClick();
    if (!name) return;
    // Placeholder save logic
  };
  
  // --- RENDER ---
  if (!permission?.granted) return <ActivityIndicator style={styles.loading} />;

  const currentLine = gameLyrics[currentLyricIndex];
  const scrollerTranslateX = gameTimeAnim.interpolate({
    inputRange: [0, songDuration],
    outputRange: [TARGET_ZONE_X, TARGET_ZONE_X - songDuration * SCROLL_SPEED],
  });

  return (
    <View style={styles.container}>
      {/* CRITICAL: Keep CameraView mounted even when game ends */}
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />

      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={handleExit}>
            <Image
              source={require("../assets/btn/back_btn.png")}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.timerText}>{displayTime}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.scoreLabel}>Score: {score}</Text>
        </View>
      </View>

      {feedback !== "" && (
        <View style={styles.feedbackOverlay}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      <View style={styles.footerBar}>
        <View style={styles.scrollerArea}>
          <View style={styles.targetZoneCircle} />

          <Animated.View
            style={[
              styles.timelineContainer,
              { transform: [{ translateX: scrollerTranslateX }] },
            ]}
          >
            {gameLyrics.map((item, index) => {
              const leftPos = item.parsedTime * SCROLL_SPEED;
              const imageSource = GESTURE_IMAGES[item.gesture];

              return (
                <View
                  key={index}
                  style={[styles.moveWrapper, { left: leftPos }]}
                >
                  <Text style={styles.promptText} numberOfLines={1}>
                    {item.prompt.toUpperCase()}
                  </Text>
                  <View style={styles.gestureBubble}>
                    {imageSource ? (
                      <Image
                        source={imageSource}
                        style={styles.gestureImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.fallbackText}>{item.gesture}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </View>

        <View style={styles.lyricsArea}>
          <Text style={styles.lyricsText}>
            {currentLine ? currentLine.text : "..."}
          </Text>
        </View>
      </View>

      {/* Render FinishScreen OVER the game, never replacing it */}
      <FinishScreen
        visible={isGameOver}
        score={score}
        onSave={handleSave}
        onExit={handleHome}
        playClick={playClick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  loading: {
    flex: 1,
    backgroundColor: "#001F3F",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: { flex: 1 },
  
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 55,
    backgroundColor: "#001F3F",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    zIndex: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 10, width: 48, height: 48 },
  backIcon: { width: 48, height: 48 },
  timerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginLeft: 4,
  },
  headerRight: {},
  scoreLabel: {
    color: "white",
    fontSize: 40,
    fontWeight: "600",
    fontFamily: "JustAnotherHand",
    marginRight: 50,
    paddingTop: 4,
  },

  feedbackOverlay: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  feedbackText: {
    fontSize: 60,
    color: "#fbbf24",
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 5,
  },

  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    flexDirection: "column",
  },
  scrollerArea: {
    height: 88,
    position: "relative",
    overflow: "hidden",
    width: "100%",
  },
  timelineContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 100000,
    paddingBottom: 2,
  },
  moveWrapper: {
    position: "absolute",
    top: 5,
    width: 80,
    alignItems: "center",
  },
  promptText: {
    color: "#fde047",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
    textShadowColor: "black",
    textShadowRadius: 2,
  },
  gestureBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
  },
  gestureImage: { width: "80%", height: "80%" },
  fallbackText: { color: "white", fontWeight: "bold", fontSize: 16 },

  targetZoneCircle: {
    position: "absolute",
    left: TARGET_ZONE_X - 5,
    top: 17,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#fde047",
    zIndex: 10,
    backgroundColor: "rgba(253, 224, 71, 0.1)",
  },
  lyricsArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "rgba(30, 58, 138, 0.4)",
  },
  lyricsText: {
    color: "white",
    fontSize: 30,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "black",
    textShadowRadius: 2,
    fontFamily: "JustAnotherHand",
  },
});