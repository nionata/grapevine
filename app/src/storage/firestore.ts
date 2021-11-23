import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from 'api/message';
import { Peer, Peers } from 'bluetooth';
import { MessageFilter, Storage } from 'storage';
import { MESSAGES_KEY, PEERS_KEY, USER_ID_KEY } from './const';
import uuid from 'react-native-uuid';
import firestore from '@react-native-firebase/firestore';

export default class FirestoreStorage implements Storage {
  private userId: string;

  constructor() {
    this.userId = '';
    this.loadUserId();
  }

  getUserId(): string {
    return this.userId;
  }

  async getMessages(filter: MessageFilter = 'all'): Promise<Message[]> {
    if (filter === 'all') {
      // do something with the filter
    }

    const documents = await firestore()
      .collection<Message>('Messages')
      .orderBy('createdAt', 'desc')
      .get();

    const messages: Message[] = [];
    documents.forEach((documentSnapshot) => {
      messages.push({
        content: documentSnapshot.data().content,
        userId: documentSnapshot.data().userId,
        createdAt: documentSnapshot.data().createdAt,
      });
    });

    return messages;
  }

  async setMessage(message: Message): Promise<void> {
    this.waitForUserId();
    message.userId = this.userId;
    message.createdAt = Date.now();

    firestore()
      .collection('Messages')
      .add(message)
      .then(() => {
        console.log('Message saved to firestore');
      })
      .catch((err: Error) => {
        console.error('Error adding msg to firestore', err);
      });
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
   * A lock for userId to safeguard against an op running while loadUserId is running
   */
  private waitForUserId() {
    while (!this.userId) {}
  }

  private async purgeAll() {
    await AsyncStorage.multiRemove([USER_ID_KEY, PEERS_KEY, MESSAGES_KEY]);
  }
}
