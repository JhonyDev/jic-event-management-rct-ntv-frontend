import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import eventService from '../services/eventService';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const data = await eventService.getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEventDetails();
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      if (event.is_registered) {
        await eventService.unregisterFromEvent(eventId);
        Alert.alert('Success', 'You have been unregistered from this event');
      } else {
        await eventService.registerForEvent(eventId);
        Alert.alert('Success', 'You have been registered for this event');
      }
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to process registration');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4A6CF7']}
          tintColor="#4A6CF7"
        />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{event.title}</Title>
          <View style={styles.chipContainer}>
            <Chip icon="calendar" style={styles.chip}>
              {new Date(event.date).toLocaleDateString()}
            </Chip>
            <Chip icon="clock" style={styles.chip}>
              {new Date(event.date).toLocaleTimeString()}
            </Chip>
          </View>
          <Paragraph style={styles.description}>{event.description}</Paragraph>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoText}>{event.location}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Organizer</Text>
            <Text style={styles.infoText}>
              {event.organizer.first_name} {event.organizer.last_name}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Attendees</Text>
            <Text style={styles.infoText}>
              {event.registrations_count} / {event.max_attendees} registered
            </Text>
          </View>

          {event.is_registered && (
            <Chip icon="check" style={styles.registeredChip}>
              You are registered
            </Chip>
          )}
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button
            mode={event.is_registered ? "outlined" : "contained"}
            onPress={handleRegister}
            loading={registering}
            disabled={registering}
          >
            {event.is_registered ? 'Unregister' : 'Register'}
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  registeredChip: {
    backgroundColor: '#4CAF50',
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  actions: {
    padding: 16,
  },
});

export default EventDetailScreen;