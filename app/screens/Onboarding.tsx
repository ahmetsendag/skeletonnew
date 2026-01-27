import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../stores/useLanguage';

const Onboarding: React.FC = () => {
  const { setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Dzardzongke Learning!</Text>
      <Text style={styles.subtitle}>Learn the beautiful Dzardzongke language through interactive lessons, quizzes, and cultural insights.</Text>
      <TouchableOpacity style={styles.button} onPress={() => setLanguage('dz')}>
        <Text style={styles.btnText}>Start Learning Dzardzongke</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Quechua content is available in the repository for future development.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: '#1f2937' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, color: '#6b7280', lineHeight: 22 },
  button: { backgroundColor: '#007AFF', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignSelf: 'center' },
  btnText: { color: 'white', fontWeight: '600', fontSize: 18 },
  hint: { marginTop: 20, textAlign: 'center', color: '#9ca3af', fontSize: 14, fontStyle: 'italic' },
});

export default Onboarding;


