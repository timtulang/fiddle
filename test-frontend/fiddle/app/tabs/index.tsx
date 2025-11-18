import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import GameScreen from './GameScreen';
import SongSelectionScreen from './SongSelectionScreen';

export type RootStackParamList = {
  SongSelect: undefined;
  Game: { songId: string }; // We pass the ID of the song
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function index() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SongSelect" component={SongSelectionScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
  );
}