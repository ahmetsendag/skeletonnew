import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  progress: number; // 0 to 1
}

export const ProgressBar: React.FC<Props> = ({ progress }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
});
