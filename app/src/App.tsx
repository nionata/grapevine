import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from 'screens/home';
import PeersScreen from 'screens/peers';
import SettingsScreen from 'screens/settings';
import BluetoothManager from 'bluetooth/manager'
import { Message } from 'api/message'

const Tab = createBottomTabNavigator()
let bluetoothManager: BluetoothManager

interface AppProps {
}
interface AppState {
  messages: Message[]
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
    this.state = {
      messages: []
    }
  }

  componentDidMount() {
    bluetoothManager = new BluetoothManager(
      () => this.state.messages,
      (message: Message) => {
        this.setState((state) => {
          return {
            messages: [...state.messages, message]
          }
        })
      }
    )
  }

  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string = '';
  
              if (route.name === 'GrapeVine') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Peers') {
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
          <Tab.Screen name="GrapeVine" children={() => <HomeScreen messages={this.state.messages}/>} />
          <Tab.Screen name="Peers" component={PeersScreen} />
          <Tab.Screen name="Settings" children={() => <SettingsScreen selectBluetoothMode={bluetoothManager.start} />} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
