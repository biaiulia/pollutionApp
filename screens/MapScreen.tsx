import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, Button, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import apiFetch from '../utils/apiFetch';
import { getToken } from '../utils/tokenStorage';

interface SensorDetails {
  temperature?: number;
  humidity?: number;
  PM25?: number;
  PM1?: number;
  PM10?: number;
  aqiLevel?: string;
  aqiColor?: string;
}

const MapScreen: React.FC = () => {
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
    const token = await getToken()
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
    const token = await getToken()
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
        Alert.alert('Subscribed', `Subscribed to sensor ${sensorId} with AQI level: ${aqiLevel}`);
      } else {
        Alert.alert('Error', 'Failed to subscribe to sensor');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe to sensor');
    }
  };

  const handleUnsubscribe = async (sensorId: string) => {
    const token = await getToken()
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
        Alert.alert('Unsubscribed', `Unsubscribed from sensor ${sensorId}`);
      } else {
        Alert.alert('Error', 'Failed to unsubscribe from sensor');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to unsubscribe from sensor');
    }
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
                    {selectedMarkerDetails.temperature !== undefined && <Text>Temperature: {selectedMarkerDetails.temperature}°C</Text>}
                    {selectedMarkerDetails.humidity !== undefined && <Text>Humidity: {selectedMarkerDetails.humidity}%</Text>}
                    {selectedMarkerDetails.PM25 !== undefined && <Text>PM2.5: {selectedMarkerDetails.PM25}</Text>}
                    {selectedMarkerDetails.PM10 !== undefined && <Text>PM10: {selectedMarkerDetails.PM10}</Text>}
                    {selectedMarkerDetails.PM1 !== undefined && <Text>PM1: {selectedMarkerDetails.PM1}</Text>}
                  </View>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
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
});

export default MapScreen;