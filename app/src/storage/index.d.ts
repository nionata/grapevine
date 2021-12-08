import { Peer, Peers } from 'bluetooth';

export type MessageFilter = 'global' | 'all' | 'authored' | 'received';

export type MessageRefType = 'authored' | 'received';

export type StorageEvent = 'transmission' | 'peer';

export type StorageEventCallback = () => Promise<void>;

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
   * from the advertising device
   */
  setAdvertisement: (ad: Advertisement) => Promise<void>;
  /**
   * Toggle the 'transmit' field on a user's message
   */
  toggleTransmission: (
    messageType: MessageRefType,
    message: Message
  ) => Promise<void>;
  /**
   * Invoke a callback function on a StorageEvent
   */
  on: (events: StorageEvent, callback: StorageEventCallback) => void;
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
  // The total number of devices the messsage has been transmitted to.
  // NOTE: This value is only consistent on authored messages.
  grapes: number;
  // The number of device "hops" this message has made from the author.
  // NOTE: This value is only consistent on received messages.
  vines: number;
  createdAt: number;
  updatedAt: number;
  receivedAt: number;
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
