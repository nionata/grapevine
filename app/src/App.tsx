// Third party
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text, TouchableOpacity } from 'react-native-ui-lib';
import Modal from 'react-native-modalbox';

// Custom
import { AppProps, AppState } from 'index';
import BluetoothManager from 'bluetooth/manager';
import { Storage } from 'storage';
import LocalStorgage from 'storage/local';
import { TEST_MESSAGES, TEST_PEERS } from 'data.test';
import { TESTING } from 'const';

// Screens
import HomeScreen from 'screens/home';
import PeersScreen from 'screens/peers';
import SettingsScreen from 'screens/settings';
import ComposeModal from 'screens/compose';

const Tab = createBottomTabNavigator();

class App extends React.Component<AppProps, AppState> {
  private composeRef: React.RefObject<Modal>;

  private storage: Storage;
  private bluetoothManager: BluetoothManager;
  private stateTicker: NodeJS.Timer | undefined;

  constructor(props: AppProps) {
    super(props);

    this.state = {
      messages: TESTING ? TEST_MESSAGES : {},
      peers: TESTING ? TEST_PEERS : {},
    };
    this.composeRef = React.createRef();

    this.storage = new LocalStorgage();
    this.storage.setMessage({
      content: 'hey david',
      userId: 'user2', // this.storage.getUserId(),
      createdAt: Date.now(),
    });
    this.bluetoothManager = new BluetoothManager(this.storage);
    this.stateTicker = setInterval(() => this.hydrateState(), 5 * 1000);
    this.hydrateState();
    this.bluetoothManager.start().then(() => {
      console.log('Bluetooth manager started');
    });
  }

  componentWillUnmount() {
    this.bluetoothManager.stop().then(() => {
      console.log('Bluetooth manager stopped');
    });
    if (this.stateTicker) {
      clearInterval(this.stateTicker);
    }
  }

  async hydrateState() {
    try {
      const messages = await this.storage.getMessages('received');
      const peers = await this.storage.getPeers();
      this.setState((state) => {
        return {
          ...state,
          messages: {
            ...state.messages,
            ...messages,
          },
          peers: {
            ...state.peers,
            ...peers,
          },
        };
      });
      console.log('State hydrated');
    } catch (err) {
      console.error(err);
    }
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
