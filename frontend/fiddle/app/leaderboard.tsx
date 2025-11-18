import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {  Image, View, Text, FlatList, StyleSheet, ImageBackground, Pressable } from "react-native";
import Colors from "@/constants/Colors";
import { router, useRouter } from "expo-router";

type Entry = { name: string; score: number };

const SAMPLE: Entry[] = [
  { name: "Timothy Tulang", score: 1200 },
  { name: "Bob The Builder", score: 1100 },
  { name: "Charlie Kirk", score: 980 },
  { name: "Bugs Bunny", score: 800 },
];

export default function Leaderboard() {
  const router = useRouter();
  
  return (
    <SafeAreaProvider style={styles.safe}>
      <Image
        source={require("../assets/bg/bg-floor-design.png")}
        style={styles.bgFloor}
        resizeMode="cover"
      />
      {/* Screen */}
      <View style={styles.screen}>
        <View style={styles.cardOuter}>
          {/* Back Button */}
          <Pressable
            onPress={() => router.push("/")}
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

            <FlatList
              data={SAMPLE}
              keyExtractor={(_, idx) => String(idx)}
              style={styles.list}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
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
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.score}>{item.score}</Text>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
            />
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bgFloor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: 400,
    zIndex: 0,
  },

  safe: { flex: 1, backgroundColor: Colors.dark.background },
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sticker: {
    position: "absolute",
    top: -80, // negative to overlap the border — tweak as needed
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
  list: { height: 200 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 28,
    gap: 20,
  },
  rank: {
    width: 48,
    fontWeight: "600",
    color: "#333",
    fontFamily: "JustAnotherHand",
  },
  rankBadge: {
    width: 48,
    height: 48,
    marginRight: 8,
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
  },
  name: {
    flex: 1,
    color: "#111",
    fontSize: 36,
    fontFamily: "JustAnotherHand",
    // backgroundColor: "green",
  },
  score: {
    width: 72,
    textAlign: "right",
    color: "#111",
    fontWeight: "600",
    fontSize: 24,
    marginRight: 4,
    fontFamily: "JustAnotherHand",
    //backgroundColor: "red",
  },

  sep: { height: 1, backgroundColor: "#EEE", marginVertical: 0 },
});
