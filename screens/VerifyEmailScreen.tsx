import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const VerifyEmailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get the token from query parameters
  const token = route.params?.token;

  useEffect(() => {
    if (token) {
      const verifyEmail = async () => {
        try {
          const response = await fetch(`http://192.168.0.100:3010/user/verify-email?token=${token}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          if (response.ok) {
            Alert.alert('Email verified', 'Your email has been successfully verified.');
            navigation.navigate('Login');
          } else {
            const errorData = await response.json();
            console.error('Verification error:', errorData);
            Alert.alert('Verification failed', errorData.message || 'Invalid or expired token.');
          }
        } catch (error) {
          console.error('Verification error:', error);
          Alert.alert('Verification failed', error.message || 'An error occurred.');
        }
      };
  
      verifyEmail();
    } else {
      Alert.alert('No token found', 'No verification token found in the URL.');
    }
  }, [token]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Verifying your email...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VerifyEmailScreen;
