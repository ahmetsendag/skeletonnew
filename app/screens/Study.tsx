import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import type { Deck } from '../types/deck';
import { Card as CardComponent } from '../components/Card';
import type { Card } from '../types/deck';
import { useProgress } from '../stores/useProgress';
import logger from '../utils/logger';

type StudyScreenRouteProp = RouteProp<RootStackParamList, 'Study'>;
type StudyScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const Study: React.FC = () => {
  const route = useRoute<StudyScreenRouteProp>();
  const navigation = useNavigation<StudyScreenNavigationProp>();
  const { deckId, cards, deckTitle } = route.params;
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const { setMastered, setLearning, countByStatus, startSession, endSession } = useProgress();
  const currentCard = cards[currentCardIndex];

  React.useEffect(() => {
    // Start a new study session when the screen mounts
    startSession(deckId, cards.length);
    
    // End the session when the screen unmounts
    return () => {
      endSession();
    };
  }, [deckId, cards.length, startSession, endSession]);

  const handleGotIt = async () => {
    logger('[handleGotIt] Before marking as mastered:', {
      deckId,
      cardId: currentCard.id,
      currentCard
    });

    await setMastered(deckId, currentCard.id, true);
    
    const masteredCount = countByStatus(deckId, 'mastered');
    logger('[handleGotIt] After marking as mastered:', {
      deckId,
      cardId: currentCard.id,
      masteredCount
    });
    if (masteredCount === cards.length) {
      endSession();
      navigation.navigate('Congrats', {
        deckTitle,
        totalCards: cards.length,
        masteredCards: masteredCount
      });
      return;
    }

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      endSession();
      navigation.goBack();
    }
  };

  const handleRepeat = () => {
    setMastered(deckId, currentCard.id, false);
    setLearning(deckId, currentCard.id, true);
    
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      endSession();
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Card {currentCardIndex + 1} of {cards.length}
      </Text>

      <CardComponent
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.gotItButton]}
          onPress={handleGotIt}
        >
          <Text style={[styles.buttonText, styles.gotItButtonText]}>Got it</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.repeatButton]}
          onPress={handleRepeat}
        >
          <Text style={[styles.buttonText, styles.repeatButtonText]}>Repeat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
    padding: 16,
  },
  progress: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gotItButton: {
    backgroundColor: '#4CAF50',
  },
  gotItButtonText: {
    color: 'white',
  },
  repeatButton: {
    backgroundColor: '#ff6b6b',
  },
  repeatButtonText: {
    color: 'white',
  },
});

export default Study;
