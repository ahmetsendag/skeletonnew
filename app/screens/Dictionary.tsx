import Fuse from 'fuse.js';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Searchbar, Snackbar, Text } from 'react-native-paper';
import { getDictionaryAudioKeys } from '../../assets/audio';
import { DictEntryCard } from '../components/DictEntryCard';
import { contentRegistry } from '../services/contentRegistry';
import { useLanguage } from '../stores/useLanguage';
import { useSaved } from '../stores/useSaved';

const Dictionary: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const { saveItem, items, loadSaved } = useSaved();
  const dictionary = contentRegistry[selectedLanguage].dictionary;

  // Debug: Log available audio keys on mount
  useEffect(() => {
    const audioKeys = getDictionaryAudioKeys();
    console.log('📖 Dictionary loaded. Available audio keys:', audioKeys);
    console.log('📖 Dictionary entries dz values:', dictionary.entries.map(e => e.dz));
  }, [dictionary]);

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(dictionary.entries);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Seed saved markers from persisted store
  React.useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  React.useEffect(() => {
    if (items && items.length) {
      const next = new Set<string>();
      items.forEach(i => next.add(`${i.prompt}=>${i.answer}`));
      setSavedKeys(next);
    }
  }, [items]);

  const markSaved = (key: string) => {
    setSavedKeys(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const fuse = useMemo(() => {
    return new Fuse(dictionary.entries, {
      keys: [
        { name: 'en', weight: 2 },
        { name: 'dz', weight: 1 },
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
      useExtendedSearch: true,
      sortFn: (a, b) => {
        if (a.score === b.score) return 0;
        return (a.score || 0) < (b.score || 0) ? -1 : 1;
      },
    });
  }, [dictionary.entries]);

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      if (!text.trim()) {
        setResults(dictionary.entries);
        return;
      }

      const exactMatches = dictionary.entries.filter(entry =>
        (entry.en || '').toLowerCase().includes(text.toLowerCase()) ||
        (entry.dz || '').toLowerCase().includes(text.toLowerCase())
      );

      if (exactMatches.length > 0) {
        setResults(exactMatches);
        return;
      }

      const searchResults = fuse.search(text);
      setResults(searchResults.map(result => result.item));
    }, 150),
    [dictionary.entries, fuse]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search in target language or English..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        autoCapitalize="none"
        icon="book-open-variant"
        iconColor="#2196F3"
      />
      {results.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noResults}>
            {searchQuery.trim() === ''
              ? 'No dictionary entries found.'
              : `No results found for "${searchQuery}"`}
          </Text>
          <Text style={styles.placeholder}>
            {searchQuery.trim() === ''
              ? 'Check back later for this language.'
              : 'Try a different search term'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {results.length} {results.length === 1 ? 'word' : 'words'} found
            </Text>
          </View>
          <FlatList
            data={results}
            renderItem={({ item }) => {
              const key = `${item.en}=>${item.dz}`;
              const isSaved = savedKeys.has(key);
              return (
                <View style={styles.itemContainer}>
                  <DictEntryCard entry={item} />
                  <View style={styles.row}>
                    {!isSaved ? (
                      <Text
                        onPress={async () => {
                          await saveItem({
                            prompt: item.en,
                            answer: item.dz,
                            language: selectedLanguage as any,
                            explanation:
                              `“${item.dz}” means “${item.en}”.` +
                              (item.example ? ` Example: ${item.example}` : ''),
                            notes: item.exampleEn,
                            source: 'dictionary',
                          });
                          markSaved(key);
                          setSnackbarMsg('Saved!');
                          setSnackbarVisible(true);
                        }}
                        style={styles.saveLink}
                      >
                        Save
                      </Text>
                    ) : (
                      <Text style={styles.savedTag}>Saved!</Text>
                    )}
                  </View>
                </View>
              );
            }}
            keyExtractor={(item, index) => `${item.dz}-${index}`}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={true}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        </>
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1200}
        style={styles.snackbar}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
    paddingTop: 8,
  },
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 56,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  resultsCount: {
    color: '#555',
    fontSize: 14,
  },
  list: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  saveLink: {
    color: '#007AFF',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  snackbar: {
    backgroundColor: '#10b981',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 8,
    color: '#888',
    fontSize: 16,
  },
  noResults: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 16,
    marginBottom: 8,
  },
  savedTag: {
    color: '#10b981',
    fontWeight: '700',
  },
});

export default Dictionary;