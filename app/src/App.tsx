// Third party
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text, TouchableOpacity } from 'react-native-ui-lib';
import Modal from 'react-native-modalbox';
import auth from '@react-native-firebase/auth';

// Custom
import { AppProps, AppState } from 'index';
import BluetoothManager from 'bluetooth/manager';
import { Storage } from 'storage';
// import LocalStorage from 'storage/local';
import FirestoreStorage from 'storage/firestore';
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
      messages: TESTING ? TEST_MESSAGES : [],
      peers: TESTING ? TEST_PEERS : {},
      isInitializing: true,
    };
    this.composeRef = React.createRef();

    this.storage = new FirestoreStorage();
    this.bluetoothManager = new BluetoothManager(this.storage);
    this.stateTicker = setInterval(() => this.hydrateState(), 5 * 1000);
    this.hydrateState();
    this.anonSignIn();
    this.bluetoothManager.start().then(() => {
      console.log('Bluetooth manager started');
    });
  }

  anonSignIn() {
    auth()
      .signInAnonymously()
      .then(() => {
        const user = auth().currentUser;
        console.log('User signed in anonymously');
        console.log('user', user);
        this.setState((state) => {
          return {
            ...state,
            isInitializing: false,
          };
        });
      })
      .catch((error) => {
        console.error(error);
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
          messages: messages,
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

  async updateMessages() {
    try {
      const messages = await this.storage.getMessages('received');
      this.setState((state) => {
        return {
          ...state,
          messages,
        };
      });
    } catch (err) {
      console.error('Err updating messages', err);
    }
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
        <Modal ref={this.composeRef} style={styles.modal} swipeToClose={true}>
          <ComposeModal
            storage={this.storage}
            requestClose={() => {
              this.composeRef?.current?.close();
              this.updateMessages();
            }}
          />
        </Modal>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    alignItems: 'center',
    width: undefined,
    height: undefined,
    flex: 1,
    paddingTop: 100,
  },
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
