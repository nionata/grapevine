import { Message } from 'api/message';
import { Peers } from 'bluetooth';
import { Device } from 'react-native-ble-plx';

export const TEST_MESSAGES = {
  id1: Message.fromJSON({
    content: "Yo paul, what's good?",
    userId: 'user1',
    createdAt: Date.now(),
  }),
  id2: Message.fromJSON({
    content: 'I am sending this message via Grapevine 🥸',
    userId: 'user2',
    createdAt: Date.now(),
  }),
  id3: Message.fromJSON({
    content: 'Adam is a silly boy',
    userId: 'user3',
    createdAt: Date.now(),
  }),
};

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
