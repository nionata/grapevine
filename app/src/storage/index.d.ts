import { Message, MessagesWrapper } from 'api/message';
import { Peer, Peers } from 'bluetooth';

export type Messages = MessagesWrapper['content'];

export type MessageFilter = 'all' | 'authored' | 'received';

export interface Storage {
  /**
   * Retrieves the user's id
   */
  getUserId: () => string;
  /**
   * Gets messages depending on the type
   */
  getMessages: (type?: MessageFilter) => Promise<Messages>;
  /**
   * Sets a message
   */
  setMessage: (message: Message, id?: string) => Promise<void>;
  /**
   * Gets peers
   */
  getPeers: () => Promise<Peers>;
  /**
   * Sets a peer
   */
  setPeer: (id: string, peer: Peer) => Promise<void>;
}
