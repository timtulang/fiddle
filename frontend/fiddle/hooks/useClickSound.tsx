import { useEffect, useRef, useCallback } from "react";
import { Audio, AVPlaybackSource } from "expo-av";

export default function useClickSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const source: AVPlaybackSource = require("../assets/audio/click_sound.wav");
        const { sound } = await Audio.Sound.createAsync(source, {
          volume: 0.8,
        });
        if (isMounted) soundRef.current = sound;
      } catch (e) {
        console.warn("Failed to load click sound:", e);
      }
    })();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const playClick = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch {}
  }, []);

  return playClick;
}
