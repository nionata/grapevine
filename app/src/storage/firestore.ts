import AsyncStorage from '@react-native-async-storage/async-storage';
import { Peer, Peers } from 'bluetooth';
import {
  Advertisement,
  Message,
  MessageFilter,
  Storage,
  WaterMarks,
} from 'storage';
import { MESSAGES_KEY, PEERS_KEY, USER_ID_KEY } from './const';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class FirestoreStorage implements Storage {
  private userId: string;
  private userIdLoaded: Promise<void>;

  constructor() {
    this.userId = '';
    this.userIdLoaded = this.loadUserId();
  }

  async getUserId(): Promise<string> {
    await this.userIdLoaded;
    return this.userId;
  }

  async getMessages(filter: MessageFilter = 'all'): Promise<Message[]> {
    try {
      const userId = await this.getUserId();
      // By default, docs are returned in ascending order by document id (timestamp)
      const authoredMessagesRef = firestore()
        .collection<Message>(authoredMessages(userId))
        .orderBy('createdAt', 'desc');
      const receivedMessagesRef = firestore()
        .collection<Message>(receivedMessages(userId))
        .orderBy('createdAt', 'desc');

      let documents: FirebaseFirestoreTypes.QueryDocumentSnapshot<Message>[];
      switch (filter) {
        case 'global':
          documents = (
            await firestore()
              .collection<Message>('Messages')
              .orderBy('createdAt', 'desc')
              .get()
          ).docs;
          break;
        case 'all':
          documents = [
            ...(await authoredMessagesRef.get()).docs,
            ...(await receivedMessagesRef.get()).docs,
          ];
          break;
        case 'authored':
          documents = (await authoredMessagesRef.get()).docs;
          break;
        case 'received':
          documents = (await receivedMessagesRef.get()).docs;
          break;
      }

      const messages: Message[] = [];
      documents.forEach((documentSnapshot) => {
        messages.push(documentSnapshot.data());
      });
      return messages;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async setMessage(content: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const timestamp = Date.now();
      await firestore().doc(authoredMessage(userId, timestamp)).set({
        content,
        userId,
        createdAt: timestamp,
        grapes: 0,
        vines: 0,
      });
      console.log('Message saved to firestore');
    } catch (err) {
      console.error('Error adding msg to firestore', err);
      throw Error(`Error adding msg to firestore ${err}`);
    }
  }

  async setAdvertisement(ad: Advertisement): Promise<void> {
    try {
      const userId = await this.getUserId();
      const { userId: adUserId, receivedAt } = ad;
      await advertisementDocRef(userId, adUserId, receivedAt).set(ad);

      // To see if we are "caught up" on the advertising user's messages, we must retrieve this user's
      // high-water marks and the high-water marks of the ad user's messages.
      const waterMarks = (await waterMarksDocRef(userId, adUserId).get()).docs;
      const adAuthoredMessages = (
        await firestore()
          .collection<Message>(authoredMessages(adUserId))
          .orderBy('createdAt')
          .limitToLast(1)
          .get()
      ).docs;
      const adReceivedMessages = (
        await firestore()
          .collection<Message>(authoredMessages(adUserId))
          .orderBy('createdAt')
          .limitToLast(1)
          .get()
      ).docs;

      console.log(waterMarks, adAuthoredMessages, adReceivedMessages);
    } catch (err) {
      console.error('Error adding advertisement to firestore', err);
      throw Error(`Error adding advertisement to firestore ${err}`);
    }
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
   * Anonymously sign in to a firebase account and retrieve the corresponding Grapevine user id.
   * The full firebase user id is too long to include in the adverstisement packet. Instead,
   * each user will have a user id assigned from a monotonic sequence value.
   */
  private async loadUserId(): Promise<void> {
    try {
      const user = await auth().signInAnonymously();
      const firebaseUid = user.user.uid;
      const userRef = firestore().collection('Users').doc(firebaseUid);
      let userId = (await userRef.get()).get('userId');
      if (userId === undefined) {
        console.log(`Assigning a Grapevine userId to new user ${firebaseUid}`);
        // If the read value does not stay consistent for the length of this txn, then the txn will fail and retry.
        // This will guarentee our userId remains consistent and there are never two users assigned the same id.
        // https://firebase.google.com/docs/firestore/manage-data/transactions#transactions
        userId = await firestore().runTransaction(async (txn) => {
          const userIdSeqRef = firestore()
            .collection('Sequences')
            .doc('userId');
          const userIdSeq = (await txn.get(userIdSeqRef)).get(
            'value'
          ) as number;
          txn.set(userRef, {
            userId: userIdSeq,
          });
          txn.update(userIdSeqRef, {
            value: userIdSeq + 1,
          });
          return userIdSeq;
        });
      }
      this.userId = String(userId);
      console.log(`User ${this.userId} signed in`);
    } catch (err) {
      console.error(err);
      // TODO: Implement a timeout - possibly even a util retryTillSuccessWithTimeout
      return this.loadUserId();
    }
  }

  private async purgeAll() {
    await AsyncStorage.multiRemove([USER_ID_KEY, PEERS_KEY, MESSAGES_KEY]);
  }
}

const authoredMessages = (userId: string): string =>
  `Messagesv1/${userId}/authored`;
const authoredMessage = (userId: string, timestamp: number): string =>
  `Messagesv1/${userId}/authored/${timestamp}`;
const receivedMessages = (userId: string): string =>
  `Messagesv1/${userId}/received`;
const receivedMessage = (userId: string, timestamp: number): string =>
  `Messagesv1/${userId}/received/${timestamp}`;

const advertisementDocRef = (
  userId: string,
  advertiser: string,
  timestamp: number
) =>
  firestore()
    .collection('Ads')
    .doc(userId)
    .collection(advertiser)
    .doc(String(timestamp));

const waterMarksDocRef = (userId: string, advertiser: string) =>
  firestore()
    .collection<WaterMarks>('WaterMarks')
    .doc(userId)
    .collection(advertiser);
