import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { hasDictionaryAudio } from '../../assets/audio';
import { audioService } from '../services/AudioService';

interface DictEntry {
  dz: string;
  en: string;
  example?: string;
  exampleEn?: string;
  audio?: string; // Optional explicit audio key override
}

interface Props {
  entry: DictEntry;
}

export const DictEntryCard: React.FC<Props> = ({ entry }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Check if audio exists for this word
  // Uses the dz field to match against audio files in dictionary_words folder
  const hasAudio = Boolean(entry.audio) || hasDictionaryAudio(entry.dz);
  const iconColor = hasAudio ? '#2196F3' : '#9ca3af';

  // Debug logging
  console.log('📖 DictEntryCard:', { word: entry.dz, hasAudio, explicitAudio: entry.audio });

  const handlePlayAudio = async () => {
    if (isPlaying || !hasAudio) return;

    try {
      setIsPlaying(true);

      if (entry.audio) {
        // Use explicit audio key if provided
        await audioService.playAudio(entry.audio);
      } else {
        // Auto-match word to audio file
        await audioService.playDictionaryAudio(entry.dz);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.wordContainer}>
            <Text variant="headlineMedium" style={styles.dzText}>
              {entry.dz}
            </Text>
            <TouchableOpacity
              onPress={handlePlayAudio}
              style={[styles.audioButton, !hasAudio && styles.audioButtonDisabled]}
              disabled={isPlaying || !hasAudio}
            >
              {isPlaying ? (
                <ActivityIndicator size={24} color={iconColor} />
              ) : (
                <MaterialIcons name="volume-up" size={24} color={iconColor} />
              )}
            </TouchableOpacity>
          </View>
          <Text variant="titleMedium" style={styles.enText}>
            {entry.en}
          </Text>
        </View>
        {entry.example && (
          <View style={styles.example}>
            <Text variant="bodyMedium" style={styles.dzExample}>
              {entry.example}
            </Text>
            {entry.exampleEn && (
              <Text variant="bodySmall" style={styles.enExample}>
                {entry.exampleEn}
              </Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 10,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: '#f0f0f0',
    borderWidth: 1,
  },
  header: {
    marginBottom: 10,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dzText: {
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: 22,
  },
  enText: {
    color: '#16213e',
    fontSize: 16,
    marginTop: 2,
  },
  audioButton: {
    marginLeft: 12,
    padding: 6,
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  example: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  dzExample: {
    color: '#16213e',
    marginBottom: 6,
  },
  enExample: {
    color: '#555',
    fontStyle: 'italic',
  },
});
