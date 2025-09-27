import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, EventsIcon, ProfileIcon } from '../components/SvgIcons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import EventInfoScreen from '../screens/EventInfoScreen';
import AgendaScreen from '../screens/AgendaScreen';
import SpeakersScreen from '../screens/SpeakersScreen';
import MapsScreen from '../screens/MapsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutScreen from '../screens/AboutScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <HomeIcon size={size} color={color} filled={focused} />;
          } else if (route.name === 'MyEvents') {
            return <EventsIcon size={size} color={color} filled={focused} />;
          } else if (route.name === 'Profile') {
            return <ProfileIcon size={size} color={color} filled={focused} />;
          }
        },
        tabBarActiveTintColor: '#4A6CF7',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
          height: 60 + Math.max(insets.bottom, 0),
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="MyEvents"
      component={HomeScreen}
      options={{
        tabBarLabel: 'My Events',
        headerTitle: 'My Events',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
  );
};

// Main Stack Navigator
const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EventDetail"
      component={EventDetailScreen}
      options={{ title: 'Event Details' }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Announcements"
      component={AnnouncementsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PrivacySecurity"
      component={PrivacySecurityScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="HelpSupport"
      component={HelpSupportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="About"
      component={AboutScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="QRScanner"
      component={QRScannerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EventInfo"
      component={EventInfoScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Agenda"
      component={AgendaScreen}
      options={{ title: 'Event Agenda' }}
    />
    <Stack.Screen
      name="Speakers"
      component={SpeakersScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Maps"
      component={MapsScreen}
      options={{ title: 'Location & Maps' }}
    />
  </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="Main" component={MainStack} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default AppNavigator;