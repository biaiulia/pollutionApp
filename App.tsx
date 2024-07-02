import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import { getToken, removeToken } from './utils/tokenStorage';

const Stack = createStackNavigator();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (token) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await removeToken();
    setIsAuthenticated(false);
  };

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? 'Map' : 'Login'}
          screenOptions={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Icon name="notifications-outline" size={25} color="black" />
              </TouchableOpacity>
            ),
            headerLeft: isAuthenticated
              ? () => (
                  <TouchableOpacity
                    style={{ marginLeft: 15 }}
                    onPress={handleLogout}
                  >
                    <Icon name="log-out-outline" size={25} color="black" />
                  </TouchableOpacity>
                )
              : null,
          })}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
