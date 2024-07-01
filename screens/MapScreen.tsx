import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, Button, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import apiFetch from '../utils/apiFetch';

interface SensorDetails {
  temperature: number;
  humidity: number;
  PM25: number;
  PM1: number;
  PM10: number;
  aqiLevel: string;
  aqiColor: string;
}

const MapScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<{ id: string, text: string, read: boolean }[]>([]);
  const [subscribedSensors, setSubscribedSensors] = useState<string[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedMarkerDetails, setSelectedMarkerDetails] = useState<SensorDetails | null>(null);

  useEffect(() => {
    fetchSensors();
    fetchSubscribedSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await apiFetch(`http://192.168.0.100:3010/sensors`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setMarkers(data);
      } else {
        console.error('Data is not an array:', data);
        setMarkers([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch sensor data');
      setMarkers([]);
    }
  };

  const fetchSubscribedSensors = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      return;
    }
    try {
      const response = await apiFetch(`http://192.168.0.100:3010/subscription/subscribed-sensors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSubscribedSensors(data.map((subscription: any) => subscription.sensorId));
    } catch (error) {
      console.error('Error fetching subscribed sensors:', error);
    }
  };

  const fetchSensorDetails = async (sensorId: string) => {

    try {
      const response = await apiFetch(`http://192.168.0.100:3010/sensor-readings/${sensorId}/latest-reading`);
      const data = await response.json();

      setSelectedMarkerDetails(data);
    } catch (error) {

      Alert.alert('Error', 'Failed to fetch sensor details');
      setSelectedMarkerDetails(null);
    }
  };

  const handleSubscribe = async (sensorId: string, aqiLevel: string) => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      Alert.alert('Error', 'No access token found');
      return;
    }

    try {
      const response = await apiFetch(`http://192.168.0.100:3010/subscription/subscribe/${sensorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSubscribedSensors([...subscribedSensors, sensorId]);
        setNotifications([...notifications, { id: sensorId, text: `Subscribed to sensor ${sensorId} with AQI level: ${aqiLevel}`, read: false }]);
      } else {
        Alert.alert('Error', 'Failed to subscribe to sensor');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe to sensor');
    }
  };

  const handleUnsubscribe = async (sensorId: string) => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      Alert.alert('Error', 'No access token found');
      return;
    }

    try {
      const response = await apiFetch(`http://192.168.0.100:3010/subscription/unsubscribe/${sensorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSubscribedSensors(subscribedSensors.filter((id) => id !== sensorId));
        setNotifications([...notifications, { id: sensorId, text: `Unsubscribed from sensor ${sensorId}`, read: false }]);
      } else {
        Alert.alert('Error', 'Failed to unsubscribe from sensor');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to unsubscribe from sensor');
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => notification.id === notificationId ? { ...notification, read: true } : notification));
  };

  const isSubscribed = (sensorId: string) => subscribedSensors.includes(sensorId);

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
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            pinColor={marker.aqiColor}
            onPress={() => fetchSensorDetails(marker.id)}
          >
            <Callout>
              <View style={styles.callout}>
                <View style={styles.calloutLeft}>
                  <Text style={styles.calloutTitle}>{marker.title}</Text>
                  <Text style={styles.calloutSubtitle}>Location: {marker.location}</Text>
                  <Text style={[styles.calloutSubtitle, { color: marker.aqiColor }]}>AQI: {marker.aqiLevel}</Text>
                  <Button
                    title={isSubscribed(marker.id) ? "Unsubscribe" : "Subscribe"}
                    onPress={() => isSubscribed(marker.id) ? handleUnsubscribe(marker.id) : handleSubscribe(marker.id, marker.aqiLevel)}
                    color="#007BFF"
                  />
                </View>
                {selectedMarkerDetails && (
                  <View style={styles.calloutRight}>
                    <Text>Temperature: {selectedMarkerDetails.temperature}°C</Text>
                    <Text>Humidity: {selectedMarkerDetails.humidity}%</Text>
                    <Text>PM2.5: {selectedMarkerDetails.PM25}</Text>
                    <Text>PM10: {selectedMarkerDetails.PM10}</Text>
                    <Text>PM1: {selectedMarkerDetails.PM1}</Text>
                  </View>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
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
    width: 330,
    flexDirection: 'row',
    padding: 10,
  },
  calloutLeft: {
    width: 150,
    marginRight: 10,
  },
  calloutRight: {
    width: 180,
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
