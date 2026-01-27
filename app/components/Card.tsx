import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import imageRegistry from '../services/imageRegistry';
import type { Card as CardType } from '../types/deck';

interface Props {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
}

// Map of color names to their CSS color values (keys are lowercase for case-insensitive match)
const colorMap: Record<string, string> = {
  'white': '#FFFFFF',
  'yellow': '#FFEB3B',
  'black': '#212121',
  'green': '#4CAF50',
  'brown': '#795548',
  'blue': '#2196F3',
  'red': '#F44336',
  'gray': '#9E9E9E',
  'grey': '#9E9E9E'
};

export const Card: React.FC<Props> = ({ card, isFlipped, onFlip }) => {
  // Check if the image exists in the generated image registry
  const imageSource = card.image ? imageRegistry[card.image] : undefined;

  // Check if this is a color card by checking if the front matches a color name (case-insensitive)
  // For color cards, we'll use the front (English) color name to determine the background color
  // regardless of whether the card is flipped or not
  const frontKey = typeof card.front === 'string' ? (card.front as string).toLowerCase() : '';
  const isColorCard = typeof card.front === 'string' && colorMap[frontKey] !== undefined;
  const cardBackgroundColor = isColorCard ? colorMap[frontKey] : undefined;

  // For dark background colors, use white text
  const isDarkColor =
    cardBackgroundColor === colorMap['black'] ||
    cardBackgroundColor === colorMap['blue'] ||
    cardBackgroundColor === colorMap['brown'] ||
    cardBackgroundColor === colorMap['green'] ||
    cardBackgroundColor === colorMap['red'];

  const formatDisplayText = (text: unknown): string => {
    const s = typeof text === 'string' ? text : '';

    // For animal cards, render phrases in lowercase per requirement
    if (card.id && typeof card.id === 'string' && card.id.startsWith('animal-')) {
      return s.toLowerCase();
    }
    return s;
  };

  if (!isFlipped && imageSource) {
    return (
      <TouchableOpacity onPress={onFlip} style={styles.container}>
        <ImageBackground source={imageSource} style={styles.imageBackground} imageStyle={styles.imageStyle}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <Text style={styles.imageText}>{formatDisplayText(card.front)}</Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onFlip}
      style={[styles.container, cardBackgroundColor ? { backgroundColor: cardBackgroundColor } : null]}
    >
      <View style={styles.content}>
        {isFlipped ? (
          <>
            <Text style={[styles.text, isDarkColor ? styles.lightText : null]}>
              {formatDisplayText(card.back)}
            </Text>
            {card.notes && (
              <Text style={[styles.notes, isDarkColor ? styles.lightText : null]}>{card.notes}</Text>
            )}
          </>
        ) : (
          <Text style={[styles.text, isDarkColor ? styles.lightText : null]}>
            {formatDisplayText(card.front)}
          </Text>
        )}
        {card.hasAudio && (
          <Ionicons name="volume-high" size={24} color="#666" style={styles.audioIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 16,
  },
  gradient: {
    width: '100%',
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  imageText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  lightText: {
    color: '#FFFFFF',
  },
  notes: {
    fontSize: 15,
    textAlign: 'left',
    marginTop: 20,
    color: '#555',
    alignSelf: 'stretch',
    fontStyle: 'italic',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 12,
  },
  audioIcon: {
    position: 'absolute',
    bottom: -10,
    right: 0,
  },
});
