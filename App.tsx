import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/LoginScreen';
import { TouchableOpacity, Alert } from 'react-native';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => Alert.alert('Notifications', 'You have new notifications')}
              >
                <Icon name="notifications-outline" size={25} color="black" />
              </TouchableOpacity>
            ),
            headerLeft: null, // To remove the back button
          })}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
