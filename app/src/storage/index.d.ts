import { Peer, Peers } from 'bluetooth';

export type MessageFilter = 'global' | 'all' | 'authored' | 'received';

export type MessageRefType = 'authored' | 'received';

export interface Storage {
  /**
   * Gets the current users's uuid string
   */
  getUserId: () => Promise<string>;
  /**
   * Gets messages depending on the type
   */
  getMessages: (type?: MessageFilter) => Promise<Message[]>;
  /**
   * Sets a new message for the user with the given content
   */
  setMessage: (content: string) => Promise<void>;
  /**
   * Sets a new advertisement for the user and saves any outstanding messages
   * from the advertising device.
   */
  setAdvertisement: (ad: Advertisement) => Promise<void>;
  /**
   * Gets peers
   * @deprecated
   */
  getPeers: () => Promise<Peers>;
  /**
   * Sets a peer
   * @deprecated
   */
  setPeer: (id: string, peer: Peer) => Promise<void>;
}

export interface Message {
  content: string;
  userId: string;
  transmit: boolean;
  grapes: number;
  vines: number;
  createdAt: number;
  updatedAt: number;
  receivedAt?: number;
}

export interface Advertisement {
  // User id of the advertiser
  userId: string;
  mtu: number;
  rssi?: number;
  receivedAt: number;
  txPowerLevel?: number;
  deviceId: string;
}

/**
 * The largest timestamp read by the user
 */
export interface WaterMarks {
  authored?: number;
  received?: number;
}
