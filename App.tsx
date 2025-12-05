import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { AssistantScreen } from './src/screens/AssistantScreen';
import { Contact, RootStackParamList } from './src/types';
// Import Firebase services (comment out to use local storage)
import {
  getContacts,
  saveContact,
  deleteContact as removeContactFromDb,
} from './src/services/firebaseStorageService';
import { tryAutoLogin, logout } from './src/services/firebaseAuthService';

// Import local services (uncomment to use local storage instead of Firebase)
// import {
//   getContacts,
//   saveContact,
//   deleteContact as removeContactFromDb,
// } from './src/services/storageService';
// import { tryAutoLogin, logout } from './src/services/authService';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showHome, setShowHome] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await tryAutoLogin();

      if (user) {
        const loadedContacts = await getContacts();
        setContacts(loadedContacts);
        setIsAuthenticated(true);
        setShowHome(false);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleLoginSuccess = async () => {
    setIsLoading(true);
    const loadedContacts = await getContacts();
    setContacts(loadedContacts);
    setIsAuthenticated(true);
    setShowHome(true);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    setContacts([]);
    setIsAuthenticated(false);
    setShowHome(false);
  };

  const handleScanComplete = async (newContact: Contact) => {
    await saveContact(newContact);
    setContacts((prev) => [newContact, ...prev]);
  };

  const handleDeleteContact = async (id: string) => {
    await removeContactFromDb(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} onSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        ) : showHome ? (
          <>
            <Stack.Screen name="Home">
              {(props) => (
                <HomeScreen
                  {...props}
                  onGetStarted={() => setShowHome(false)}
                  onScanClick={() => props.navigation.navigate('Scanner')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardScreen
                  {...props}
                  contacts={contacts}
                  onScanClick={() => props.navigation.navigate('Scanner')}
                  onDeleteContact={handleDeleteContact}
                  onLogout={handleLogout}
                  onAIAssistant={() => props.navigation.navigate('Assistant')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Scanner">
              {(props) => (
                <ScannerScreen
                  {...props}
                  existingContacts={contacts}
                  onClose={() => props.navigation.goBack()}
                  onScanComplete={(contact) => {
                    handleScanComplete(contact);
                    props.navigation.goBack();
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Assistant">
              {(props) => (
                <AssistantScreen
                  {...props}
                  contacts={contacts}
                  onClose={() => props.navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardScreen
                  {...props}
                  contacts={contacts}
                  onScanClick={() => props.navigation.navigate('Scanner')}
                  onDeleteContact={handleDeleteContact}
                  onLogout={handleLogout}
                  onAIAssistant={() => props.navigation.navigate('Assistant')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Scanner">
              {(props) => (
                <ScannerScreen
                  {...props}
                  existingContacts={contacts}
                  onClose={() => props.navigation.goBack()}
                  onScanComplete={(contact) => {
                    handleScanComplete(contact);
                    props.navigation.goBack();
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Assistant">
              {(props) => (
                <AssistantScreen
                  {...props}
                  contacts={contacts}
                  onClose={() => props.navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});
