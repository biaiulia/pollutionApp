import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, Text, Button, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

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

  const markers = [
    {
      id: 'ii3254',
      location: 'Calea Victoriei',
      latitude: 44.433696,
      longitude: 26.097924,
      title: 'Airly Sensor 1',
      data: {
        temperature: 25,
        humidity: 60,
        pm25: 10, // Good
        pm10: 20,
        pm1: 5,
      },
    },
    {
      id: 'i97068',
      location: 'Bulevardul Libertatii',
      latitude: 44.425483,
      longitude: 26.091003,
      title: 'Airly Sensor 2',
      data: {
        temperature: 30,
        humidity: 55,
        pm25: 75, // Moderate
        pm10: 25,
        pm1: 8,
      },
    },
    {
      id: 'i115449',
      location: 'Strada Mihail Sebastian',
      latitude: 44.417647,
      longitude: 26.071874,
      title: 'Airly Sensor 3',
      data: {
        temperature: 35,
        humidity: 65,
        pm25: 160, // Unhealthy
        pm10: 18,
        pm1: 7,
      },
    },
    {
      id: 'i4456',
      location: 'Piata Libertatii',
      latitude: 44.418534,
      longitude: 26.095916,
      title: 'Edge Node',
      data: {
        temperature: 32,
        humidity: 65,
        pm25: 200, // Very Unhealthy
        pm10: 18,
        pm1: 7,
      },
    },
  ];

  const handleSubscribe = (sensorId: string, aqiLevel: string) => {
    setSubscribedSensors([...subscribedSensors, sensorId]);
    setNotifications([...notifications, { id: sensorId, text: `Subscribed to sensor ${sensorId} with AQI level: ${aqiLevel}`, read: false }]);
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
          const { level, color } = calculateAQI(marker.data.pm25);
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
                    <Text>Temperature: {marker.data.temperature}°C</Text>
                    <Text>Humidity: {marker.data.humidity}%</Text>
                    <Text>PM2.5: {marker.data.pm25}</Text>
                    <Text>PM10: {marker.data.pm10}</Text>
                    <Text>PM1: {marker.data.pm1}</Text>
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
