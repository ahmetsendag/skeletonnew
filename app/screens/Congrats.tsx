import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

type CongratsScreenRouteProp = RouteProp<RootStackParamList, 'Congrats'>;
type CongratsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const Congrats: React.FC = () => {
  const navigation = useNavigation<CongratsScreenNavigationProp>();
  const route = useRoute<CongratsScreenRouteProp>();
  const { deckTitle, totalCards, masteredCards } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>You've mastered all cards in {deckTitle}!</Text>
        <Text style={styles.stats}>{masteredCards} out of {totalCards} cards mastered</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Decks')}>
        <Text style={styles.buttonText}>Back to Decks</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, justifyContent: 'space-between' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 16 },
  subtitle: { fontSize: 18, color: '#333', textAlign: 'center', marginBottom: 8 },
  stats: { fontSize: 16, color: '#666' },
  button: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
