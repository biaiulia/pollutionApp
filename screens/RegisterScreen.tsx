import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { sanitizeInput } from '../sanitize';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

type RootStackParamList = {
  Login: undefined;
  Map: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Add your project ID here
      })).data;
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }
    return token;
  };

  const handleRegister = async () => {
    // Sanitize user inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPassword = sanitizeInput(password);
  

  
    // Perform registration
    try {
      ('Sending registration request');
      const response = await fetch(`http://192.168.0.100:3010/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
      });
  

  
      if (response.ok) {
        const data = await response.json();
        const expoToken = await registerForPushNotificationsAsync();
  
        if (expoToken) {
          await fetch(`http://192.168.0.100:3010/user/expo-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.access_token}`,
            },
            body: JSON.stringify({ token: expoToken }),
          });
        }
  
        navigation.navigate('Map');
      } else {
        const errorData = await response.json();
        Alert.alert('Registration failed', errorData.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert('Registration failed', error.message || 'An error occurred');
    }
  };
  

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Register</Title>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default RegisterScreen;
