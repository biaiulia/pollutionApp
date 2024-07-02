import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { sanitizeInput } from '../sanitize';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { storeToken } from '../utils/tokenStorage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Map: undefined;
  VerifyEmail: { token: string };
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // TODO: See with notifications
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
        projectId: 'your-project-id',  // Add your project ID here
      })).data;
    } else {
     // Alert.alert('Must use physical device for Push Notifications');
    }
    return token;
  };

  const handleLogin = async () => {
    // Sanitize user inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPassword = sanitizeInput(password);

  
    // Perform login
    try {
console.log(process.env.EXPO_PUBLIC_API_BASE_URL)
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
      });
  

  
      if (response.ok) {
        const data = await response.json();

        await storeToken(data.access_token); // Store the token
        const expoToken = await registerForPushNotificationsAsync();
  
        if (expoToken) {
          await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/expo-token`, {
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

        Alert.alert('Login failed', errorData.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login failed', error.message || 'An error occurred');
    }
  };
  

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Login</Title>
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
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Register')} style={styles.registerButton}>
        Don't have an account? Register
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
  registerButton: {
    marginTop: 16,
  },
});

export default LoginScreen;
