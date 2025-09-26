import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { HomeIcon, EventsIcon, ProfileIcon } from '../components/SvgIcons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
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
const MainTabs = () => (
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
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
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
  </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="Main" component={MainStack} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AppNavigator;