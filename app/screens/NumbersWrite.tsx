import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import type { Card } from '../types/deck';
import { useProgress } from '../stores/useProgress';
import { useLanguage } from '../stores/useLanguage';

type NumbersWriteScreenRouteProp = RouteProp<RootStackParamList, 'NumbersWrite'>;
type NumbersWriteScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const NumbersWrite: React.FC = () => {
  const route = useRoute<NumbersWriteScreenRouteProp>();
  const navigation = useNavigation<NumbersWriteScreenNavigationProp>();
  const { deckId, cards } = route.params;
  const { selectedLanguage } = useLanguage();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const { setMastered, setLearning, startSession, endSession } = useProgress();
  const currentCard = cards[currentCardIndex];

  React.useEffect(() => {
    // Start a new study session when the screen mounts
    startSession(deckId, cards.length);
    
    // End the session when the screen unmounts
    return () => {
      endSession();
    };
  }, [deckId, cards.length, startSession, endSession]);

  const checkAnswer = () => {
    // Case insensitive comparison and trim whitespace
    const isAnswerCorrect = userInput.toLowerCase().trim() === currentCard.back.toLowerCase().trim();
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      setMastered(deckId, currentCard.id, true);
    } else {
      setLearning(deckId, currentCard.id, true);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setUserInput('');
      setShowResult(false);
      setShowAnswer(false);
    } else {
      // Completed all cards
      // End the session before navigating away
      endSession();
      
      Alert.alert(
        "Congratulations!",
        "You've completed the numbers deck!",
        [{ text: "OK", onPress: () => navigation.navigate('DeckList') }]
      );
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Card {currentCardIndex + 1} of {cards.length}
      </Text>
      
      <View style={styles.cardContainer}>
        <Text style={styles.prompt}>
          {selectedLanguage === 'qu' ? 'Write the Quechua word for:' : 'Write the Dzardzongke word for:'}
        </Text>
        <Text style={styles.number}>{currentCard.front}</Text>
        
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your answer here..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!showResult}
          onSubmitEditing={checkAnswer}
        />
        
        {!showResult ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.checkButton]} 
              onPress={checkAnswer}
            >
              <Text style={styles.buttonText}>Check</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.showAnswerButton]} 
              onPress={handleShowAnswer}
            >
              <Text style={[styles.buttonText, styles.showAnswerText]}>Show Answer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {isCorrect ? (
              <Text style={[styles.resultText, styles.correctText]}>
                You got it! 🎉
              </Text>
            ) : (
              <Text style={[styles.resultText, styles.incorrectText]}>
                Try again! The correct answer is: <Text style={styles.answer}>{currentCard.back}</Text>
              </Text>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.nextButton]} 
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>
                {currentCardIndex < cards.length - 1 ? 'Next Number' : 'Finish'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {showAnswer && !showResult && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>Answer:</Text>
            <Text style={styles.answer}>{currentCard.back}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  progress: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    justifyContent: 'center',
  },
  prompt: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  number: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginRight: 8,
  },
  showAnswerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  showAnswerText: {
    color: '#007AFF',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#FF3B30',
  },
  answerContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  answer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default NumbersWrite;
