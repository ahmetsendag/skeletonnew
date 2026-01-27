import { MaterialIcons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { audioService } from '../services/AudioService';
import { contentRegistry } from '../services/contentRegistry';
import { useLanguage } from '../stores/useLanguage';

type ConversationPracticeRouteProp = RouteProp<{
  params: {
    categoryId: string;
    conversationId: string;
    title: string;
  };
}, 'params'>;

const { width } = Dimensions.get('window');

export const ConversationPractice: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<ConversationPracticeRouteProp>();
  const { categoryId, conversationId, title } = route.params;
  const { selectedLanguage } = useLanguage();
  const categories = contentRegistry[selectedLanguage].conversations.categories;
  const category = categories.find(cat => cat.id === categoryId);
  const conversation = category?.conversations.find(conv => conv.id === conversationId);
  const exchanges = conversation ? conversation.exchanges : [];
  
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'both' | 'english' | 'dz'>('both');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  const speakingAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Conversation Practice',
    });
  }, [navigation, title]);



    // Auto-play first message audio when conversation starts
  useEffect(() => {
    if (currentExchangeIndex === 0) {
      const ex = exchanges[0];
      if (ex) {
        console.log('🎵 Auto-playing first message for conversation:', conversationId);
        audioService.playConversationAudio(conversationId, 1, 'A').catch((error) => {
          console.error('❌ First message audio failed:', error);
        });
      }
    }
  }, []); // Only run once when component mounts

  useEffect(() => {
    // Reset animation when changing exchanges
    speakingAnimation.setValue(0);
    
    // Start speaking animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(speakingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(speakingAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 4 }
    ).start();

    // Scroll to bottom when changing exchanges (WhatsApp-like)
    if (scrollViewRef.current) {
      setTimeout(() => {
        try {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch {}
      }, 0);
    }

    // Auto-play audio for new messages when advancing
    if (currentExchangeIndex > 0) {
      const ex = exchanges[currentExchangeIndex];
      if (ex) {
        const exchangeNumber = currentExchangeIndex + 1;
        console.log('🎵 Auto-playing message:', conversationId, exchangeNumber, ex.speaker);
        audioService.playConversationAudio(conversationId, exchangeNumber, ex.speaker).catch((error) => {
          console.error('❌ New message audio failed:', error);
        });
      }
    }
    
    // Clean up sound when component unmounts or exchange changes
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentExchangeIndex]);

  const handleNext = () => {
    if (currentExchangeIndex < exchanges.length - 1) {
      setCurrentExchangeIndex(currentExchangeIndex + 1);
    } else {
      // End of conversation
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentExchangeIndex > 0) {
      setCurrentExchangeIndex(currentExchangeIndex - 1);
    }
  };

  const cycleViewMode = () => {
    setViewMode(prev => (prev === 'both' ? 'english' : prev === 'english' ? 'dz' : 'both'));
  };


  const currentExchange = exchanges[currentExchangeIndex];
  const isSpeakerA = currentExchange?.speaker === 'A';
  
  // Animation for mouth movement
  const mouthTransform = {
    transform: [
      {
        scaleY: speakingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.7],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentExchangeIndex + 1} / {exchanges.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentExchangeIndex + 1) / exchanges.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.characterContainer}>
          {/* Speaker A */}
          <View style={[
            styles.character, 
            isSpeakerA ? styles.activeSpeaker : styles.inactiveSpeaker
          ]}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarImage, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.avatarText}>A</Text>
              </View>
              {isSpeakerA && (
                <Animated.View style={[styles.mouth, mouthTransform]} />
              )}
            </View>
            <Text style={styles.speakerLabel}>Speaker A</Text>
          </View>
          
          {/* Speaker B */}
          <View style={[
            styles.character, 
            !isSpeakerA ? styles.activeSpeaker : styles.inactiveSpeaker
          ]}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarImage, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.avatarText}>B</Text>
              </View>
              {!isSpeakerA && (
                <Animated.View style={[styles.mouth, mouthTransform]} />
              )}
            </View>
            <Text style={styles.speakerLabel}>Speaker B</Text>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.contentContainer}
          contentContainerStyle={styles.contentInner}
        >
          {exchanges.slice(0, currentExchangeIndex + 1).map((ex, idx) => {
            const left = ex.speaker === 'A';
            return (
              <View style={styles.bubbleContainer} key={`${ex.speaker}-${idx}`}>
                <View style={[styles.bubble, left ? styles.bubbleLeft : styles.bubbleRight]}>
                  {viewMode !== 'dz' && (
                    <Text style={styles.bubbleText}>{ex.english}</Text>
                  )}
                  {viewMode === 'both' && <View style={{ height: 6 }} />}
                  {viewMode !== 'english' && (
                    <Text style={[styles.bubbleText, styles.translationText]}>{ex.dzardzongke}</Text>
                  )}
                  {/* Replay button */}
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => {
                      const exchangeNumber = idx + 1;
                      console.log('🎵 Playing conversation audio:', conversationId, exchangeNumber, ex.speaker);
                      audioService.playConversationAudio(conversationId, exchangeNumber, ex.speaker).catch((error) => {
                        console.error('❌ Failed to play audio:', error);
                      });
                    }}
                    style={{ marginTop: 8, alignSelf: left ? 'flex-start' : 'flex-end' }}
                  >
                    <MaterialIcons name="volume-up" size={20} color="#0f172a" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, currentExchangeIndex === 0 ? styles.disabledButton : {}]}
            onPress={handlePrevious}
            disabled={currentExchangeIndex === 0}
          >
            <MaterialIcons 
              name="arrow-back" 
              size={24} 
              color={currentExchangeIndex === 0 ? '#ccc' : '#007AFF'} 
            />
            <Text style={[
              styles.controlText,
              currentExchangeIndex === 0 ? styles.disabledText : {}
            ]}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.translationButton}
            onPress={cycleViewMode}
          >
            <MaterialIcons 
              name={'visibility'} 
              size={24} 
              color="#007AFF" 
            />
            <Text style={styles.controlText}>
              {viewMode === 'both' ? 'Show English only' : viewMode === 'english' ? 'Show Dzardzongke only' : 'Show Both'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handleNext}
          >
            <Text style={styles.controlText}>
              {currentExchangeIndex < exchanges.length - 1 ? 'Next' : 'Finish'}
            </Text>
            <MaterialIcons 
              name={currentExchangeIndex < exchanges.length - 1 ? 'arrow-forward' : 'check'} 
              size={24} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  characterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  character: {
    alignItems: 'center',
    width: width / 3,
  },
  activeSpeaker: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  inactiveSpeaker: {
    opacity: 0.6,
    transform: [{ scale: 0.9 }],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  mouth: {
    position: 'absolute',
    bottom: 20,
    width: 20,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
  },
  speakerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 16,
  },
  contentInner: {
    paddingBottom: 16,
  },
  bubbleContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bubble: {
    padding: 16,
    borderRadius: 16,
    maxWidth: '80%',
  },
  bubbleLeft: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: '#E2F0FE',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    color: '#333',
  },
  translationContainer: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  translationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  translationBubble: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 16,
  },
  translationText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  controlText: {
    fontSize: 16,
    color: '#007AFF',
    marginHorizontal: 4,
  },
  disabledText: {
    color: '#ccc',
  },
  translationButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
  },
});
