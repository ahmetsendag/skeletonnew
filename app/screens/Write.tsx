import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useProgress } from '../stores/useProgress';
import type { Card } from '../types/deck';

type RootStackParamList = {
  Write: { deckId: string; cards: Card[] };
};

interface Props {
  navigation: any;
  route: any;
}

export const Write: React.FC<Props> = ({ navigation, route }) => {
  const { deckId, cards } = route.params;
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const { setMastered } = useProgress();

  const currentCard = cards[currentCardIndex];
  
  // Convert PNG filename to clean text for comparison
  const getCleanText = (text: string) => {
    if (text.endsWith('.png')) {
      // Remove .png and convert kebab-case to Title Case
      return text
        .replace('.png', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return text;
  };
  
  const cleanBackText = getCleanText(currentCard.back);
  const isCorrect = userInput.toLowerCase().trim() === cleanBackText.toLowerCase().trim();

  const handleCheck = () => {
    setShowResult(true);
    if (isCorrect) {
      // fix: provide namespaced deckId + cardId
      setMastered(deckId, currentCard.id, true);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setUserInput('');
      setShowResult(false);
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.front}>{currentCard.front}</Text>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type the Dzardzongke word..."
          onSubmitEditing={handleCheck}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          editable={!showResult}
        />
        {!showResult ? (
          <TouchableOpacity style={styles.button} onPress={handleCheck}>
            <Text style={styles.buttonText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={[styles.result, isCorrect ? styles.correct : styles.incorrect]}>
              {isCorrect ? '✓ Correct!' : `✗ Incorrect. The answer is: ${cleanBackText}`}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>
                {currentCardIndex < cards.length - 1 ? 'Next' : 'Finish'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.progress}>
          {currentCardIndex + 1} / {cards.length}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100, // Extra padding for keyboard
  },
  front: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 16,
    fontSize: 18,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    width: '100%',
    gap: 16,
  },
  result: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  correct: {
    color: '#34C759',
  },
  incorrect: {
    color: '#FF3B30',
  },
  progress: {
    position: 'absolute',
    bottom: 32,
    fontSize: 16,
    color: '#666',
  },
});
