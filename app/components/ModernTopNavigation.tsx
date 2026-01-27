import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { useAuth } from '../stores/useAuth';

interface ModernTopNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const { width } = Dimensions.get('window');

const ModernTopNavigation: React.FC<ModernTopNavigationProps> = ({ currentTab, onTabChange }) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = useAuth();

  const tabs = [
    { key: 'DeckStack', label: 'Decks', icon: 'albums-outline', activeIcon: 'albums' },
    { key: 'Stats', label: 'Progress', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
    { key: 'Dictionary', label: 'Dictionary', icon: 'book-outline', activeIcon: 'book' },
    { key: 'Conversations', label: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
    { key: 'MultipleChoice', label: 'Quiz', icon: 'checkbox-outline', activeIcon: 'checkbox' },
    { key: 'Culture', label: 'Culture', icon: 'earth-outline', activeIcon: 'earth' },
  ];

  const handleTabPress = (tabKey: string) => {
    onTabChange(tabKey);
    if (tabKey === 'DeckStack') {
      navigation.navigate('DeckStack');
    } else {
      navigation.navigate(tabKey as any);
    }
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <View style={styles.container}>
      {/* Header with app title */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>Dzardzongke</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Learn • Practice • Master</Text>
          </View>
        </View>
      </View>

      {/* Mobile Navigation Row - Tabs + Menu */}
      <View style={styles.mobileNavRow}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollView}
          style={styles.tabScrollContainer}
        >
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => handleTabPress(tab.key)}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={18}
                    color={isActive ? '#6366f1' : '#6b7280'}
                  />
                  <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                    {tab.label}
                  </Text>
                </View>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {/* Three dots menu - fixed position */}
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity onPress={openMenu} style={styles.mobileMenuButton}>
              <MaterialCommunityIcons name="dots-vertical" size={20} color="#6b7280" />
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Settings'); }}>
            <MaterialCommunityIcons name="cog" size={18} color="#0f172a" />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Profile'); }}>
            <MaterialCommunityIcons name="bookmark-outline" size={18} color="#0f172a" />
            <Text style={styles.menuText}>Saved</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Credits'); }}>
            <MaterialCommunityIcons name="information-outline" size={18} color="#0f172a" />
            <Text style={styles.menuText}>Credits</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={async () => { closeMenu(); await logout(); }}>
            <MaterialCommunityIcons name="logout" size={18} color="#0f172a" />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mobileNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  tabScrollContainer: {
    flex: 1,
  },
  tabScrollView: {
    alignItems: 'center',
    paddingRight: 8,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 2,
    position: 'relative',
    minWidth: 60,
  },
  activeTab: {
    backgroundColor: '#f0f4ff',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#6366f1',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 2,
    backgroundColor: '#6366f1',
    borderRadius: 1,
  },
  mobileMenuButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginLeft: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
});

export default ModernTopNavigation;
