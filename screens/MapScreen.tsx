import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, Button, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to calculate AQI based on PM2.5
const calculateAQI = (pm25: number): { level: string; color: string } => {
  if (pm25 <= 50) return { level: 'Good', color: 'green' };
  if (pm25 <= 100) return { level: 'Moderate', color: 'yellow' };
  if (pm25 <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'orange' };
  if (pm25 <= 200) return { level: 'Unhealthy', color: 'red' };
  if (pm25 <= 300) return { level: 'Very Unhealthy', color: 'purple' };
  return { level: 'Hazardous', color: 'maroon' };
};

const MapScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<{ id: string, text: string, read: boolean }[]>([]);
  const [subscribedSensors, setSubscribedSensors] = useState<string[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await fetch('http://localhost:3010/api/sensor-readings');
      const data = await response.json();
      setMarkers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch sensor data');
    }
  };

  const handleSubscribe = async (sensorId: string, aqiLevel: string) => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      Alert.alert('Error', 'No access token found');
      return;
    }

    try {
      await fetch('http://localhost:3010/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sensorId }),
      });
      setSubscribedSensors([...subscribedSensors, sensorId]);
      setNotifications([...notifications, { id: sensorId, text: `Subscribed to sensor ${sensorId} with AQI level: ${aqiLevel}`, read: false }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe to sensor');
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => notification.id === notificationId ? { ...notification, read: true } : notification));
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 44.4211,
          longitude: 26.0963,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {markers.map(marker => {
          const { level, color } = calculateAQI(marker.pm25);
          return (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              pinColor={color}
            >
              <Callout>
                <View style={styles.callout}>
                  <View style={styles.calloutLeft}>
                    <Text style={styles.calloutTitle}>{marker.title}</Text>
                    <Text style={styles.calloutSubtitle}>Location: {marker.location}</Text>
                    <Text style={[styles.calloutSubtitle, { color }]}>AQI: {level}</Text>
                    <Button
                      title="Subscribe"
                      onPress={() => handleSubscribe(marker.id, level)}
                      color="#007BFF"
                    />
                  </View>
                  <View style={styles.calloutRight}>
                    <Text>Temperature: {marker.temperature}°C</Text>
                    <Text>Humidity: {marker.humidity}%</Text>
                    <Text>PM2.5: {marker.pm25}</Text>
                    <Text>PM10: {marker.pm10}</Text>
                    <Text>PM1: {marker.pm1}</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
      <View style={styles.notificationsContainer}>
        <Text style={styles.notificationsTitle}>Notifications</Text>
        <ScrollView>
          {notifications.map(notification => (
            <TouchableOpacity key={notification.id} onPress={() => markAsRead(notification.id)}>
              <View style={[styles.notification, notification.read ? styles.notificationRead : styles.notificationUnread]}>
                <Text>{notification.text}</Text>
              </View>
            </TouchableOpacity>
          ))}
               </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
  },
  callout: {
    flexDirection: 'row',
    padding: 10,
  },
  calloutLeft: {
    flex: 1,
    marginRight: 10,
  },
  calloutRight: {
    flex: 1,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  calloutSubtitle: {
    fontSize: 14,
    marginBottom: 3,
  },
  notificationsContainer: {
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 200,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notification: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  notificationRead: {
    backgroundColor: '#e0e0e0',
  },
  notificationUnread: {
    backgroundColor: '#ffffff',
  },
});

export default MapScreen;

