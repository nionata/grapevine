import { Message } from 'api/message';
import { Peer, Peers } from 'bluetooth';

export type MessageFilter = 'all' | 'authored' | 'received';

export interface Storage {
  /**
   * Gets the current users's uuid string
   */
  getUserId: () => string;
  /**
   * Gets messages depending on the type
   */
  getMessages: (type?: MessageFilter) => Promise<Message[]>;
  /**
   * Sets a new message for the user with the given content
   */
  setMessage: (content: string) => Promise<void>;
  /**
   * Gets peers
   */
  getPeers: () => Promise<Peers>;
  /**
   * Sets a peer
   */
  setPeer: (id: string, peer: Peer) => Promise<void>;
}
