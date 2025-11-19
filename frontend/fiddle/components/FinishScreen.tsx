import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";

type FinishScreenProps = {
  visible: boolean;
  score: number;
  onSave: (name: string) => void;
  onExit: () => void;
  playClick: () => void;
};

export default function FinishScreen({
  visible,
  score,
  onSave,
  onExit,
  playClick,
}: FinishScreenProps) {
  const [name, setName] = useState("");

  // 1. If not visible, render nothing.
  if (!visible) return null;

  return (
    // 2. Use an absolute view instead of <Modal>
    <View style={styles.overlayContainer}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Image
            source={require("../assets/bg/great_sticker.png")}
            style={styles.titleImage}
            resizeMode="contain"
          />
          <Text style={styles.scoreLabel}>
            Score: {"  "} {score}
          </Text>

          <View style={{ display: "flex", flexDirection: "row" }}>
            <Text style={styles.nameLabel}>Name: {"  "} </Text>
            <TextInput
              placeholder="Enter name"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.imgBtnWrapper}
              onPress={() => {
                playClick();
                onSave(name.trim());
              }}
            >
              <Image
                source={require("../assets/btn/result-save.png")}
                style={styles.resultBtn}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imgBtnWrapper}
              onPress={() => {
                playClick();
                onExit();
              }}
            >
              <Image
                source={require("../assets/btn/result-exit.png")}
                style={styles.resultBtn}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 3. New style to make this View cover the whole screen
  overlayContainer: {
    ...StyleSheet.absoluteFillObject, // Short for: position: 'absolute', top:0, left:0...
    zIndex: 100, // Ensure it sits on top of the camera
    elevation: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleImage: {
    position: "absolute",
    top: -55,
    alignSelf: "center",
    width: 300,
    height: 140,
    zIndex: 10,
  },
  card: {
    width: 360,
    paddingHorizontal: 40,
    paddingBottom: 24,
    paddingTop: 60,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "black",
  },
  scoreLabel: {
    fontSize: 40,
    fontWeight: "600",
    color: "#001F3F",
    marginBottom: 4,
    fontFamily: "JustAnotherHand",
  },
  nameLabel: {
    fontSize: 40,
    fontWeight: "600",
    color: "#001F3F",
    marginBottom: 4,
    fontFamily: "JustAnotherHand",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "JustAnotherHand",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  imgBtnWrapper: {
    flex: 1,
    alignItems: "center",
  },
  resultBtn: {
    width: 50,
    height: 50,
  },
});