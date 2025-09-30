import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, EventsIcon, ProfileIcon, BellIcon } from '../components/SvgIcons';
import { useTheme } from '../context/ThemeContext';
import announcementService from '../services/announcementService';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import BrowseEventsScreen from '../screens/BrowseEventsScreen';
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

// Badge component for tab icons
const TabIconWithBadge = ({ IconComponent, size, color, badgeCount, ...props }) => {
  return (
    <View style={{ position: 'relative' }}>
      <IconComponent size={size} color={color} {...props} />
      {badgeCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -8,
          backgroundColor: '#EF4444',
          borderRadius: 10,
          minWidth: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 'bold',
          }}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load unread announcements count
    const loadUnreadCount = async () => {
      try {
        const count = await announcementService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <HomeIcon size={size} color={color} filled={focused} />;
          } else if (route.name === 'MyEvents') {
            return <EventsIcon size={size} color={color} filled={focused} />;
          } else if (route.name === 'Announcements') {
            return (
              <TabIconWithBadge
                IconComponent={BellIcon}
                size={size}
                color={color}
                filled={focused}
                badgeCount={unreadCount}
              />
            );
          } else if (route.name === 'Profile') {
            return <ProfileIcon size={size} color={color} filled={focused} />;
          }
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
          height: 60 + Math.max(insets.bottom, 0),
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
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
        headerTitle: 'Home',
      }}
    />
    <Tab.Screen
      name="MyEvents"
      component={MyEventsScreen}
      options={{
        tabBarLabel: 'My Events',
        headerTitle: 'My Events',
      }}
    />
    <Tab.Screen
      name="Announcements"
      component={AnnouncementsScreen}
      options={{
        tabBarLabel: 'Announcements',
        headerTitle: 'Announcements',
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
const MainStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          color: theme.colors.onSurface,
        },
      }}
    >
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
        name="BrowseEvents"
        component={BrowseEventsScreen}
        options={{ title: 'Browse Events' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={({ route }) => ({
          title: 'Edit Profile',
          headerRight: () => route.params?.headerRight || null,
        })}
      />
      <Stack.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{ title: 'Announcements' }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{ title: 'Privacy & Security' }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventInfo"
        component={EventInfoScreen}
        options={{ title: 'Event Information' }}
      />
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ title: 'Event Agenda' }}
      />
      <Stack.Screen
        name="Speakers"
        component={SpeakersScreen}
        options={{ title: 'Event Speakers' }}
      />
      <Stack.Screen
        name="Maps"
        component={MapsScreen}
        options={{ title: 'Location & Maps' }}
      />
    </Stack.Navigator>
  );
}

// Root Navigator
const AppNavigator = () => {
  const { theme } = useTheme();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.border,
      notification: theme.colors.primary,
      primary: theme.colors.primary,
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              color: theme.colors.onSurface,
            },
          }}>
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="Main" component={MainStack} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default AppNavigator;