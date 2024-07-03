import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import apiFetch from '../utils/apiFetch';
import { getToken } from '../utils/tokenStorage';

interface Notification {
  id: string;
  userId: string;
  message: string;
  dateTime: Date;
  isRead: boolean;
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = await getToken()
    if (!token) {
      Alert.alert('Error', 'No access token found');
      return;
    }

    try {
      const response = await apiFetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
console.log(response)
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        } else {
          Alert.alert('No new notifications');
        }
      } else {
        Alert.alert('Error', 'Failed to fetch notifications');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch notifications');
    }
  };

  return (
    <View style={styles.container}>
    
      {notifications.length === 0 ? (
        <Text style={styles.noNotificationsText}>You have no new notifications</Text>
      ) : (
        <ScrollView>
          {notifications.map((notification) => (
            <View key={notification.id} style={styles.notification}>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationDate}>
                {new Date(notification.dateTime).toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noNotificationsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
  },
  notification: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  notificationMessage: {
    fontSize: 16,
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});

export default NotificationsScreen;
