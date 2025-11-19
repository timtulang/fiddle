import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Image,
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Audio, Video, ResizeMode } from "expo-av";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

import Colors from "@/constants/Colors";
import useClickSound from "@/hooks/useClickSound";
import { db } from "@/firebaseConfig"; // Import your config

type Entry = { id: string; name: string; score: number };

export default function Leaderboard() {
  const router = useRouter();
  const playClick = useClickSound();
  const [leaders, setLeaders] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // --- AUDIO: Play Home BGM ---
  useFocusEffect(
    useCallback(() => {
      let soundObject: Audio.Sound | null = null;

      async function playBGM() {
        try {
          // Reusing Home BGM as requested
          const { sound } = await Audio.Sound.createAsync(
            require("../assets/audio/home_bgm.mp3"),
            { isLooping: true, volume: 0.5 }
          );
          soundObject = sound;
          await sound.playAsync();
        } catch (error) {
          console.warn("Error playing Leaderboard BGM:", error);
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

  // --- FIREBASE: Fetch Scores ---
  useEffect(() => {
    async function fetchScores() {
      try {
        const scoresRef = collection(db, "scores");
        const q = query(scoresRef, orderBy("score", "desc"), limit(20));
        const querySnapshot = await getDocs(q);

        const fetched: Entry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            name: data.name || "Unknown",
            score: data.score || 0,
          });
        });

        setLeaders(fetched);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, []);

  return (
    <SafeAreaProvider style={styles.safe}>
      {/* 1. VIDEO BACKGROUND */}
      <Video
        source={require("../assets/bg/menu_bg.mp4")}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={true}
      />
      {/* 2. DARK OVERLAY */}
      <View style={styles.overlay} />

      {/* Screen Content */}
      <View style={styles.screen}>
        <View style={styles.cardOuter}>
          {/* Back Button */}
          <Pressable
            onPress={() => {
              playClick();
              router.push("/");
            }}
            style={styles.backLeaderboard}
          >
            <Image
              source={require("../assets/btn/back_leaderboard.png")}
              style={styles.backLeaderboardImg}
              resizeMode="contain"
            />
          </Pressable>

          <View style={styles.cardInner}>
            {/* Sticker Title */}
            <Image
              source={require("../assets/bg/leaderboard-title.png")}
              style={styles.sticker}
              resizeMode="contain"
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fbbf24" />
              </View>
            ) : (
              <FlatList
                data={leaders}
                keyExtractor={(item) => item.id}
                style={styles.list}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false} // Clean look
                contentContainerStyle={{ paddingBottom: 16 }}
                renderItem={({ item, index }) => (
                  <View style={styles.row}>
                    <ImageBackground
                      source={require("../assets/bg/badge-rank.png")}
                      style={styles.rankBadge}
                      imageStyle={styles.rankBadgeImage}
                    >
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </ImageBackground>
                    
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.score}>{item.score}</Text>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No scores yet!</Text>
                }
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "black" },
  
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)", // Dark overlay for readability
    zIndex: 1,
  },

  screen: {
    flex: 1,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sticker: {
    position: "absolute",
    top: -80,
    alignSelf: "center",
    width: 380,
    height: 140,
    zIndex: 10,
  },
  cardOuter: {
    width: "85%",
    maxWidth: 550,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    paddingVertical: 18,
    paddingHorizontal: 18,
    position: "relative",
  },
  cardInner: {
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#312B2B",
    paddingTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 32,
    height: 300, // Fixed height to allow scrolling within card
  },
  backLeaderboard: {
    position: "absolute",
    top: 28,
    left: 28,
    width: 48,
    height: 48,
    zIndex: 1,
  },
  backLeaderboardImg: {
    width: 48,
    height: 48,
  },
  list: { flex: 1 },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 20,
  },
  rankBadge: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeImage: {
    resizeMode: "contain",
  },
  rankText: {
    fontWeight: "600",
    color: "#333",
    fontFamily: "JustAnotherHand",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 4, // Visual center adjustment
  },
  name: {
    flex: 1,
    color: "#111",
    fontSize: 36,
    fontFamily: "JustAnotherHand",
  },
  score: {
    width: 80,
    textAlign: "right",
    color: "#fbbf24", // Gold score color
    fontWeight: "600",
    fontSize: 28,
    fontFamily: "JustAnotherHand",
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 1,
  },
  sep: { height: 1, backgroundColor: "#EEE", marginVertical: 0 },
  emptyText: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: "JustAnotherHand",
    color: '#666',
    marginTop: 20,
  }
});