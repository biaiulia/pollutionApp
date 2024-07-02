import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Confirmation: undefined;
  Login: undefined;
};

type ConfirmationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Confirmation'>;
type ConfirmationScreenRouteProp = RouteProp<RootStackParamList, 'Confirmation'>;

type Props = {
  navigation: ConfirmationScreenNavigationProp;
  route: ConfirmationScreenRouteProp;
};

const ConfirmationScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>Subscribed successfully! Please check your email.</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default ConfirmationScreen;
