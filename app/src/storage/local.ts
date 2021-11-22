import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from 'api/message';
import { Peer, Peers } from 'bluetooth';
import { MessageFilter, Messages, Storage } from 'storage';
import { MESSAGES_KEY, PEERS_KEY, USER_ID_KEY } from './const';
import uuid from 'react-native-uuid';

export default class LocalStorgage implements Storage {
  private userId: string;

  constructor() {
    this.userId = '';
    this.loadUserId();
  }

  getUserId(): string {
    this.waitForUserId();
    return this.userId;
  }

  async getMessages(filter: MessageFilter = 'all'): Promise<Messages> {
    // if (filter === 'authored') {
    //   return {
    //     id1: Message.fromJSON({
    //       content: 'hi bby',
    //       userId: this.userId,
    //       createdAt: Date.now(),
    //     }),
    //   };
    // }
    const encodedMessages = await AsyncStorage.getItem(MESSAGES_KEY);
    if (!encodedMessages) {
      return {};
    }
    const messages: Messages = JSON.parse(encodedMessages);
    if (filter === 'all') {
      return messages;
    }
    let filteredMessages: Messages = {};
    this.waitForUserId();
    for (const [key, message] of Object.entries(messages)) {
      const isMatch =
        filter === 'authored'
          ? message.userId === this.userId
          : message.userId !== this.userId;
      if (isMatch) {
        filteredMessages[key] = message;
      }
    }
    return filteredMessages;
  }

  async setMessage(
    message: Message,
    id: string = uuid.v4() as string
  ): Promise<void> {
    let messages = await this.getMessages();
    this.waitForUserId();
    messages[id] = message;
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
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
      // await this.purgeAll();
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
   * A lock for userId to safeguard against an op running while loadUserId is running
   */
  private waitForUserId() {
    while (!this.userId) {}
  }

  private async purgeAll() {
    await AsyncStorage.multiRemove([USER_ID_KEY, PEERS_KEY, MESSAGES_KEY]);
  }
}
