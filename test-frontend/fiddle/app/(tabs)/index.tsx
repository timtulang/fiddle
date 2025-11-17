import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// --- Minimal typing for CameraView ref ---
// (Your existing interface is fine, but let's use the full type
// to be more robust, as we fixed in the previous step)
import type { CameraView as CameraViewType } from 'expo-camera';


// 🛑 Replace with your PC's local IP
const SERVER_IP = '192.168.1.100';
const API_URL = `http://${SERVER_IP}:8000/process-image`;

const POSE_SEQUENCE = ['A', 'C', 'V', 'I love you'];
const BEAT_INTERVAL_MS = 2000; // 2 seconds per pose

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraViewType>(null); // Use the full type

  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [feedback, setFeedback] = useState('Get Ready...');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- 1. ADD NEW STATE ---
  // This will store the raw output from your model
  const [lastDetectedPose, setLastDetectedPose] = useState('');

  const targetPose = POSE_SEQUENCE[currentPoseIndex % POSE_SEQUENCE.length];

  // Request camera permissions
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't run capture if the previous one is still processing
      if (!isProcessing) {
        captureAndAnalyze();
        setCurrentPoseIndex((prev) => prev + 1);
      }
    }, BEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [currentPoseIndex, isProcessing]); // Dependencies are correct

  // Capture image and analyze pose
  const captureAndAnalyze = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);
    setFeedback('...');
    // We clear the last pose on each new attempt
    setLastDetectedPose(''); 

    const poseToCompare = POSE_SEQUENCE[currentPoseIndex % POSE_SEQUENCE.length];

    try {
      const photo = await cameraRef.current.takePictureAsync({ // Use takePictureAsync
        quality: 0.2,
        base64: true,
        skipProcessing: true,
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64_image: photo.base64 }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();
      const detectedGesture = result.gesture;
      
      // --- 2. SET THE NEW STATE ---
      // Store the model's output regardless of what it is
      setLastDetectedPose(detectedGesture);

      // (Your existing feedback logic is perfect)
      if (detectedGesture === poseToCompare) {
        setFeedback('PERFECT!');
      } else if (detectedGesture !== 'No hand') {
        setFeedback('GREAT!');
      } else {
        setFeedback('MISS!');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to analyze pose.');
      setFeedback('Error');
    }

    setIsProcessing(false);
  };

  if (!permission) {
    return <ActivityIndicator style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedback}</Text>
          
          {/* --- 3. DISPLAY THE STATE --- */}
          {/* Show the raw output, but only if it's not empty */}
          {lastDetectedPose !== '' && (
            <Text style={styles.detectedPoseText}>
              (You did: {lastDetectedPose})
            </Text>
          )}

        </View>

        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>TARGET POSE:</Text>
          <Text style={styles.targetText}>{targetPose}</Text>
        </View>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'space-between',
    padding: 50,
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  // --- 4. ADD STYLES FOR THE NEW TEXT ---
  detectedPoseText: {
    fontSize: 24,
    color: '#ccc', // A dimmer white
    marginTop: 10,
  },
  targetContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 20,
  },
  targetLabel: {
    fontSize: 18,
    color: '#ccc',
  },
  targetText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
});