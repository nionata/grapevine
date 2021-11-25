import { Message } from 'storage';
import { Peers } from 'bluetooth';
import { Device } from 'react-native-ble-plx';

export const TEST_MESSAGES = [
  {
    content: "Yo paul, what's good?",
    createdAt: Date.now(),
  } as Message,
  {
    content: 'I am sending this message via Grapevine 🥸',
    createdAt: Date.now(),
  } as Message,
  {
    content: 'Adam is a silly boy',
    createdAt: Date.now(),
  } as Message,
];

export const TEST_PEERS: Peers = {
  id1: {
    encounters: 3,
    transmissions: 2,
    rssi: -47,
    mtu: 5,
    device: {
      id: 'device1',
      name: 'Device 1',
    } as Device,
  },
  id2: {
    encounters: 3,
    transmissions: 2,
    rssi: -47,
    mtu: 5,
    device: {
      id: 'device2',
      name: 'Device 2',
    } as Device,
  },
  id3: {
    encounters: 3,
    transmissions: 2,
    rssi: -47,
    mtu: 5,
    device: {
      id: 'device3',
      name: 'Device 3',
    } as Device,
  },
};
