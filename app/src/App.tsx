// Third party
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TouchableOpacity } from 'react-native-ui-lib';
import Modal from 'react-native-modalbox';

// Custom
import BluetoothManager from 'bluetooth/manager';
import { Message } from 'api/message';
import { Peer } from 'bluetooth';
import { AppProps, AppState } from 'index';
import { GRAPEVINE_MESSAGE } from 'Const';

// Screens
import HomeScreen from 'screens/home';
import PeersScreen from 'screens/peers';
import SettingsScreen from 'screens/settings';
import ComposeModal from 'screens/compose';

const Tab = createBottomTabNavigator();

class App extends React.Component<AppProps, AppState> {
  private composeRef: React.RefObject<Modal>;
  constructor(props: AppProps) {
    super(props);
    this.composeRef = React.createRef();
    this.state = {
      messages: [],
      manager: new BluetoothManager(
        () => this.state.messages,
        async () => {
          const message = (await AsyncStorage.getItem(GRAPEVINE_MESSAGE)) || '';
          return [
            {
              content: message,
            },
          ];
        },
        (message: Message) => {
          this.setState((state) => {
            return {
              ...state,
              messages: [...state.messages, message],
            };
          });
        },
        () => this.state.peers,
        (id: string, peer: Peer) => {
          this.setState((state) => {
            return {
              ...state,
              peers: {
                ...state.peers,
                [id]: peer,
              },
            };
          });
        }
      ),
      peers: {},
    };
    this.state.manager.start().then(() => {
      console.log('Bluetooth manager started');
    });
  }

  onClose() {
    console.log('Modal just closed');
  }

  onOpen() {
    console.log('Modal just opened');
  }

  onClosingState(state: boolean) {
    console.log('the open/close of the swipeToClose just changed', state);
  }

  componentWillUnmount() {
    this.state.manager.stop().then(() => {
      console.log('Bluetooth manager stopped');
    });
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
          <Tab.Screen
            name="GrapeVine"
            children={() => <HomeScreen messages={this.state.messages} />}
          />
          <Tab.Screen
            name="Peers"
            children={() => <PeersScreen peers={this.state.peers} />}
          />
          <Tab.Screen name="Settings" children={() => <SettingsScreen />} />
        </Tab.Navigator>

        {/* floating action button to compose message */}
        <TouchableOpacity style={styles.floatingButton}>
          <Text onPress={() => this.composeRef.current?.open()}>
            <Ionicons name="add" size={30} color="white" />
          </Text>
        </TouchableOpacity>

        {/* Pops up modal from bottom, overriding any page to show the compose screen */}
        <ComposeModal ref={this.composeRef} />
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  floatingButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    position: 'absolute',
    bottom: 100,
    right: 30,
    height: 50,
    backgroundColor: 'blueviolet',
    borderRadius: 100,
  },
});

export default App;
