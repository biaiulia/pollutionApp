import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import apiFetch from '../utils/apiFetch';
import { getToken } from '../utils/tokenStorage';

interface Notification {
  id: string;
  message: string;
  dateTime: string;
  isRead: boolean;
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = await getToken();
    if (!token) {
      return;
    }
    try {
      const response = await apiFetch(`http://192.168.0.100:3010/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch notifications');
      setNotifications([]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {notifications.length === 0 ? (
          <Text style={styles.noNotificationsText}>No new notifications</Text>
        ) : (
          notifications.map(notification => (
            <View key={notification.id} style={styles.notificationContainer}>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationDate}>{new Date(notification.dateTime).toLocaleString()}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  noNotificationsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  notificationContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default NotificationsScreen;
