import { Device } from 'react-native-ble-plx';

export interface Peer {
  device: Device;
  encounters: number;
  transmissions: number;
  rssi: number | null;
  mtu: number;
}
export type Peers = { [key: string]: Peer };

export interface Task {
  poweredOn: boolean;
  run(): Promise<void>;
  stop(): Promise<void>;
}
