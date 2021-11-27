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
import FirestoreStorage from 'storage/firestore';
import { TEST_MESSAGES, TEST_PEERS } from 'data.test';
import { TESTING } from 'const';

// Screens
import HomeScreen from 'screens/home';
import ComposeModal from 'screens/compose';
import ProfileScreen from 'screens/profile';

const Tab = createBottomTabNavigator();

class App extends React.Component<AppProps, AppState> {
  private composeRef: React.RefObject<Modal>;

  public storage: Storage;
  private bluetoothManager: BluetoothManager;
  private stateTicker: NodeJS.Timer | undefined;

  constructor(props: AppProps) {
    super(props);

    this.composeRef = React.createRef();

    this.storage = new FirestoreStorage();
    this.bluetoothManager = new BluetoothManager(this.storage);
    this.bluetoothManager.start().then(() => {
      console.log('Bluetooth manager started');
    });

    this.state = {
      messages: TESTING ? TEST_MESSAGES : [],
      peers: TESTING ? TEST_PEERS : {},
      isInitializing: true,
    };
    this.stateTicker = setInterval(() => this.hydrateState(), 5 * 1000);
    new Promise(async () => {
      await this.storage.getUserId();
      await this.hydrateState();
    })
      .then(() => {
        this.setState((state) => {
          return {
            ...state,
            isInitializing: false,
          };
        });
      })
      .catch((err) => {
        console.error(err);
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

              if (route.name === 'Grapevine') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'blueviolet',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: 'blueviolet',
            },
            headerTintColor: 'white',
          })}
        >
          <Tab.Screen
            name="Grapevine"
            children={() => (
              <HomeScreen
                messages={this.state.messages}
                refreshMessages={() => this.updateMessages()}
              />
            )}
          />
          <Tab.Screen
            name="Profile"
            children={() => <ProfileScreen peers={this.state.peers} />}
          />
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
