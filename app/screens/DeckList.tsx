import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { contentRegistry, nsDeckId } from '../services/contentRegistry';
import { useLanguage } from '../stores/useLanguage';
import { useProgress } from '../stores/useProgress';
import type { Deck } from '../types/deck';

const DeckList: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const getDeckProgress = useProgress(state => state.getDeckProgress);
  const { selectedLanguage } = useLanguage();
  const decks: Deck[] = contentRegistry[selectedLanguage].decks;

  const renderItem = ({ item: deck }: { item: Deck }) => {
    const namespacedId = nsDeckId(selectedLanguage, deck.id);
    const masteredCount = getDeckProgress(namespacedId, deck.cards);
    const progress = deck.cards.length > 0 ? masteredCount / deck.cards.length : 0;

    return (
      <TouchableOpacity
        style={styles.deckItem}
        onPress={() => navigation.navigate('Study', { deckId: namespacedId, cards: deck.cards, deckTitle: deck.title })}
      >
        <Text style={styles.title}>{deck.title}</Text>
        <Text style={styles.description}>{deck.description}</Text>
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
          <Text style={styles.cardCount}>{deck.cards.length} cards</Text>
        </View>
        
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => navigation.navigate('Write', { 
            deckId: namespacedId, 
            cards: deck.cards,
            deckTitle: deck.title 
          })}
        >
          <Text style={styles.practiceButtonText}>✍️ Practice Writing</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={decks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    padding: 20,
  },
  deckItem: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardCount: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  practiceButton: {
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e7ff',
    alignSelf: 'flex-start',
  },
  practiceButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default DeckList;
export { DeckList };
