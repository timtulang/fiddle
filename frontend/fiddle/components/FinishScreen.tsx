import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>FINISHED</Text>
          <Text style={styles.scoreLabel}>Score: {score}</Text>
          <TextInput
            placeholder="Enter name"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => {
                playClick();
                onSave(name.trim());
              }}
            >
              <Text style={styles.btnText}>SAVE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => {
                playClick();
                onExit();
              }}
            >
              <Text style={styles.btnText}>EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 360,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(30,58,138,0.95)",
    borderWidth: 2,
    borderColor: "#60a5fa",
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fbbf24",
    textAlign: "center",
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "#60a5fa",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    marginRight: 8,
    alignItems: "center",
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
