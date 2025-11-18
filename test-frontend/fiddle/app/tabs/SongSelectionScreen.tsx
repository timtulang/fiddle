import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '.';
import songsConfig from './songs_config.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SongSelect'>;

export default function SongSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleSongPress = (songId: string) => {
    // Navigate to Game and pass the song ID
    navigation.navigate('Game', { songId });
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleSongPress(index.toString())} // Using index as ID for simplicity
      /*
      
      */
    >
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.difficulty}>{item.difficulty}</Text>
          <Text style={styles.duration}>{Math.floor(item.song_duration/60)}:{(item.song_duration%60).toString().padStart(2,'0')}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>▶</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SELECT A TRACK</Text>
      <FlatList
        data={songsConfig.songs}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60, paddingHorizontal: 20 },
  header: { fontSize: 32, color: '#fbbf24', fontWeight: '900', marginBottom: 30, textAlign: 'center' },
  list: { paddingBottom: 40 },
  card: {
    backgroundColor: 'rgba(30, 58, 138, 0.6)',
    borderRadius: 15,
    marginBottom: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  cardContent: { flex: 1 },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  author: { color: '#94a3b8', fontSize: 14, marginBottom: 5 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
  difficulty: { color: '#4ade80', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  duration: { color: 'white', fontSize: 12 },
  arrow: { color: '#fbbf24', fontSize: 24, marginLeft: 10 },
});