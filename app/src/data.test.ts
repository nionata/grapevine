import { Message } from 'api/message';
import { Peers } from 'bluetooth';
import { Device } from 'react-native-ble-plx';

export const TEST_MESSAGES = [
  Message.fromJSON({
    content: "Yo paul, what's good?",
  }),
  Message.fromJSON({
    content: 'I am sending this message via Grapevine 🥸',
  }),
  Message.fromJSON({
    content: 'Adam is a silly boy',
  }),
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
