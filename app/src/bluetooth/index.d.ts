import { Message } from 'api/message';
import { Device } from 'react-native-ble-plx';

export type GetMessages = () => Message[];
export type GetTransmittableMessages = () => Promise<Message[]>;
export type SetMessage = (message: Message) => void;

export interface Peer {
  device: Device;
  encounters: number;
  transmissions: number;
  rssi: number | null;
  mtu: number;
}
export type Peers = { [key: string]: Peer };
export type GetPeers = () => Peers;
export type SetPeer = (id: string, peer: Peer) => void;

export interface Task {
  poweredOn: boolean;
  run(): Promise<void>;
  stop(): Promise<void>;
}
