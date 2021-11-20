import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from 'screens/home';
import ScanScreen from './screens/scan';
import AdvertiseScreen from 'screens/advertise';
import SettingsScreen from 'screens/settings';

const Tab = createBottomTabNavigator();

const App = () => {
  // const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = '';

            if (route.name === 'GrapeVine') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Advertise') {
              iconName = focused ? 'bluetooth' : 'bluetooth-outline'
            } else if (route.name === 'Scan') {
              iconName = focused ? 'bluetooth' : 'bluetooth-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'cog' : 'cog-outline';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'blueviolet',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="GrapeVine" component={HomeScreen} />
        <Tab.Screen name="Advertise" component={AdvertiseScreen} />
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
