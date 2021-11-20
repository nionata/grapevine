import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from 'screens/home';
import ScanScreen from 'screens/peers';
import SettingsScreen from 'screens/settings';
import BluetoothManager, { BluetoothMode } from 'bluetooth/manager'
import { Message } from 'api/message'

const Tab = createBottomTabNavigator();

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
    const bluetoothManager = new BluetoothManager(
      BluetoothMode.Advertise, 
      () => this.state.messages,
      (message: Message) => {
        console.log(this.state.messages, message)
        this.setState((state) => {
          return {
            messages: [...state.messages, message]
          }
        })
      }
    )
    bluetoothManager.start()
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
          <Tab.Screen name="Peers" component={ScanScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
