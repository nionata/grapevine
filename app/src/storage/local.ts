import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Messages } from 'api/message';
import { fromByteArray, toByteArray } from 'base64-js';
import { Peer, Peers } from 'bluetooth';
import { Advertisement, MessageFilter, Storage } from 'storage';
import { MESSAGES_KEY, PEERS_KEY, USER_ID_KEY } from './const';
import uuid from 'react-native-uuid';

/**
 * @deprecated
 */
export default class LocalStorage implements Storage {
  private userId: string;
  private userIdLoaded: Promise<void>;

  constructor() {
    this.userId = '';
    this.userIdLoaded = this.loadUserId();
  }
  setAdvertisement: (ad: Advertisement) => Promise<boolean>;

  async getUserId(): Promise<string> {
    await this.userIdLoaded;
    return this.userId;
  }

  async getMessages(filter: MessageFilter = 'all'): Promise<Message[]> {
    const encodedMessages = await AsyncStorage.getItem(MESSAGES_KEY);
    if (!encodedMessages) {
      return [];
    }
    const messages = Messages.decode(toByteArray(encodedMessages)).messages;
    if (filter === 'all') {
      return messages;
    }
    await this.userIdLoaded;
    return messages.filter((message) =>
      filter === 'authored'
        ? message.userId === this.userId
        : message.userId !== this.userId
    );
  }

  async setMessage(content: string): Promise<void> {
    await this.userIdLoaded;
    const message = {
      content,
      userId: this.userId,
      createdAt: Date.now(),
    };
    let messages = await this.getMessages();
    messages.push(message);
    const messagesByteArr = Messages.encode(
      Messages.fromJSON({
        messages,
      })
    ).finish();
    await AsyncStorage.setItem(MESSAGES_KEY, fromByteArray(messagesByteArr));
  }

  async getPeers(): Promise<Peers> {
    const encodedPeers = await AsyncStorage.getItem(PEERS_KEY);
    if (!encodedPeers) {
      return {};
    }
    return JSON.parse(encodedPeers);
  }

  async setPeer(id: string, peer: Peer): Promise<void> {
    let peers = await this.getPeers();
    peers[id] = peer;
    await AsyncStorage.setItem(PEERS_KEY, JSON.stringify(peers));
  }

  /**
   * Load the user id into memory. The user id should be generated once on the first time the app is opened.
   * Subsequent sessions should retrieve the user id from storage.
   */
  private async loadUserId() {
    try {
      let userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        userId = uuid.v4() as string;
        await AsyncStorage.setItem(USER_ID_KEY, userId);
      }
      this.userId = userId;
      console.log(`Loaded user ${this.userId}`);
    } catch (err) {
      console.error(err);
      this.loadUserId();
    }
  }

  /**
   * NOTE: This will clear all local data. This should only be used in testing.
   */
  private async purgeAll() {
    await AsyncStorage.multiRemove([USER_ID_KEY, PEERS_KEY, MESSAGES_KEY]);
  }
}
