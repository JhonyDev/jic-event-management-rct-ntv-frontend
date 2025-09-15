import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  PersonalInfoIcon,
  EventsIcon,
  NotificationIcon,
  SecurityIcon,
  HelpIcon,
  InfoIcon,
  LogoutIcon
} from '../components/SvgIcons';
import authService from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [userInfo] = useState({
    name: 'Thomas Anderson',
    email: 'thomas@email.com',
    phone: '+1 234 567 8900',
    memberSince: 'January 2024',
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await authService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const menuItems = [
    {
      icon: PersonalInfoIcon,
      title: 'Personal Information',
      onPress: () => Alert.alert('Personal Info', 'Edit your profile details'),
    },
    {
      icon: EventsIcon,
      title: 'My Events',
      onPress: () => Alert.alert('My Events', 'View your registered events'),
    },
    {
      icon: NotificationIcon,
      title: 'Notifications',
      onPress: () => Alert.alert('Notifications', 'Manage your notifications'),
    },
    {
      icon: SecurityIcon,
      title: 'Privacy & Security',
      onPress: () => Alert.alert('Privacy', 'Manage your privacy settings'),
    },
    {
      icon: HelpIcon,
      title: 'Help & Support',
      onPress: () => Alert.alert('Support', 'Contact: support@jic-events.com'),
    },
    {
      icon: InfoIcon,
      title: 'About',
      onPress: () => Alert.alert('About', 'JIC Event Management\nVersion 1.0.0'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>TA</Text>
          </View>
          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>
          <Text style={styles.memberSince}>Member since {userInfo.memberSince}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <IconComponent size={24} />
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <View style={styles.chevron}>
                  <Text style={styles.chevronText}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogoutIcon size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  userSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A6CF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  menuContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
  },
  chevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronText: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;