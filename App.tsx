import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-get-random-values';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { KeyboardConfig } from './app/components/KeyboardConfig';
import ModernTopNavigation from './app/components/ModernTopNavigation';
import Account from './app/screens/Account';
import Login from './app/screens/Auth/Login';
import SignUp from './app/screens/Auth/SignUp';
import { Congrats } from './app/screens/Congrats';
import { ConversationCategories } from './app/screens/ConversationCategories';
import { ConversationList } from './app/screens/ConversationList';
import { ConversationPractice } from './app/screens/ConversationPractice';
import Credits from './app/screens/Credits';
import Culture from './app/screens/CultureDynamic';
import DeckList from './app/screens/DeckList';
import Dictionary from './app/screens/Dictionary';
import MultipleChoice from './app/screens/MultipleChoice';
import NumbersWrite from './app/screens/NumbersWrite';
import Onboarding from './app/screens/Onboarding';
import Profile from './app/screens/Profile';
import Settings from './app/screens/Settings';
import { Stats } from './app/screens/Stats';
import Study from './app/screens/Study';
import { Write } from './app/screens/Write';
import { useAuth } from './app/stores/useAuth';
import { useLanguage } from './app/stores/useLanguage';
import { useProgress } from './app/stores/useProgress';

const InnerStack = createStackNavigator();
const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();

function DeckStack() {
  return (
    <InnerStack.Navigator>
      <InnerStack.Screen name="Decks" component={DeckList} />
      <InnerStack.Screen name="Study" component={Study} />
      <InnerStack.Screen name="Write" component={Write} options={{ title: 'Write Practice' }} />
      <InnerStack.Screen name="NumbersWrite" component={NumbersWrite} options={{ title: 'Numbers Practice' }} />
      <InnerStack.Screen name="Congrats" component={Congrats} />
    </InnerStack.Navigator>
  );
}

function ConversationsStack() {
  return (
    <InnerStack.Navigator>
      <InnerStack.Screen name="Categories" component={ConversationCategories} options={{ title: 'Conversation Categories' }} />
      <InnerStack.Screen name="ConversationList" component={ConversationList} options={({ route }: any) => ({ title: route.params?.title || 'Conversations' })} />
      <InnerStack.Screen name="ConversationPractice" component={ConversationPractice} options={({ route }: any) => ({ title: route.params?.title || 'Practice' })} />
    </InnerStack.Navigator>
  );
}

function MainTabs() {
  const [currentTab, setCurrentTab] = useState('DeckStack');

  const renderCurrentScreen = () => {
    switch (currentTab) {
      case 'DeckStack':
        return <DeckStack />;
      case 'Stats':
        return <Stats />;
      case 'Dictionary':
        return <Dictionary />;
      case 'Conversations':
        return <ConversationsStack />;
      case 'MultipleChoice':
        return <MultipleChoice />;
      case 'Culture':
        return <Culture />;
      default:
        return <DeckStack />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ModernTopNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
      <View style={{ flex: 1 }}>
        {renderCurrentScreen()}
      </View>
    </View>
  );
}

export default function App() {
  const loadProgress = useProgress(state => state.loadProgress);
  const { loadLanguage, hasChosenLanguage } = useLanguage();
  const { currentUser, hydrate } = useAuth();

  useEffect(() => {
    loadProgress();
    loadLanguage();
    hydrate();
  }, [loadProgress, loadLanguage, hydrate]);

  const theme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, surface: '#ffffff', onSurface: '#0f172a' } } as typeof MD3LightTheme;

  return (
    
    <PaperProvider theme={theme}>
      <KeyboardConfig >
        <NavigationContainer >
          {!currentUser ? (
            <AuthStack.Navigator>
              <AuthStack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <AuthStack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
            </AuthStack.Navigator>
          ) : !hasChosenLanguage ? (
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              <RootStack.Screen name="Onboarding" component={Onboarding} />
            </RootStack.Navigator>
          ) : (
            <RootStack.Navigator screenOptions={{ cardStyle: { flex: 1 } }}>
              <RootStack.Screen  name="Main" component={MainTabs} options={{ headerShown: false }} />
              <RootStack.Screen name="Settings" component={Settings} options={{ headerTitle: 'Settings' }} />
              <RootStack.Screen name="Account" component={Account} options={{ headerTitle: 'Account' }} />
              <RootStack.Screen name="Profile" component={Profile} options={{ headerTitle: 'Saved' }} />
              <RootStack.Screen name="Credits" component={Credits} options={{ headerTitle: 'Credits' }} />
            </RootStack.Navigator>
          )}
        </NavigationContainer>
      </KeyboardConfig>
    </PaperProvider>
    
  );
}
