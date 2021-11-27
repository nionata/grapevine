import AsyncStorage from '@react-native-async-storage/async-storage';
import { Peer, Peers } from 'bluetooth';
import {
  Advertisement,
  Message,
  MessageFilter,
  MessageRefType,
  Storage,
  WaterMarks,
} from 'storage';
import { MESSAGES_KEY, PEERS_KEY, USER_ID_KEY } from './const';
import firestore, {
  firebase,
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
      const authoredMessagesRef = messagesCollectionRef(
        userId,
        'authored'
      ).orderBy('createdAt', 'desc');
      const receivedMessagesRef = messagesCollectionRef(
        userId,
        'received'
      ).orderBy('createdAt', 'desc');

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
      const message: Message = {
        content,
        userId,
        grapes: 0,
        vines: 0,
        transmit: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        receivedAt: timestamp,
      };
      await messageDocRef(userId, 'authored', timestamp).set(message);
      console.log('Message saved to firestore');
    } catch (err) {
      const errorMessage = 'Error adding msg to firestore';
      console.error(errorMessage, err);
      throw Error(`${errorMessage} ${err}`);
    }
  }

  async setAdvertisement(ad: Advertisement): Promise<void> {
    try {
      const userId = await this.getUserId();
      const { userId: adUserId, receivedAt } = ad;
      // The native bluetooth module does not support scanning and advertising at the same time.
      // However, just in case something like this does occur let's just ignore those ads.
      if (userId === adUserId) {
        return;
      }
      await advertisementDocRef(userId, adUserId, receivedAt).set(ad);

      // To see if we are "caught up" on the advertising user's messages, we must retrieve this user's
      // high-water marks and the high-water marks of the ad user's messages.
      // TODO: Add a txn to cover the water mark read and write (read other values with firebase not txn)
      const waterMarks: WaterMarks = {
        ...(await waterMarksDocRef(userId, adUserId).get()).data(),
      };
      const adLastAuthoredTime = (
        await messagesCollectionRef(adUserId, 'authored')
          .orderBy('createdAt')
          .limitToLast(1)
          .get()
      ).docs
        .pop()
        ?.data().createdAt;
      const adLastReceivedTime = (
        await messagesCollectionRef(adUserId, 'received')
          .orderBy('createdAt')
          .limitToLast(1)
          .get()
      ).docs
        .pop()
        ?.data().createdAt;
      console.log(
        `Comparing water marks: authored ${waterMarks.authored} v ${adLastAuthoredTime} / received ${waterMarks.received} v ${adLastReceivedTime}`
      );

      // The following should handle the cases:
      // 1. There are no water marks (ie. the current user hasn't received from the ad user yet) and
      //    a. there are no messages: undefined === undefined
      //    b. there are messages: undefined !== <latest time>
      // 2. There are water marks (ie. the current user has received from the ad user before) and
      //    a. the lastest time is the same as the water mark: <latest time> === <latest time>
      //    b. the latest time is greater than the water mark: <prev time> !== <latest time>
      let receivedDocs: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[] =
        [];
      let updatedWaterMarks = { ...waterMarks };
      if (waterMarks?.authored !== adLastAuthoredTime) {
        receivedDocs.push(
          ...(
            await messagesCollectionRef(adUserId, 'authored')
              .orderBy('createdAt')
              .startAfter(waterMarks?.authored ? waterMarks.authored : 0)
              .endAt(adLastAuthoredTime)
              .where('transmit', '==', true)
              .get()
          ).docs
        );
        updatedWaterMarks.authored = adLastAuthoredTime;
      }
      if (waterMarks?.received !== adLastReceivedTime) {
        receivedDocs.push(
          ...(
            await messagesCollectionRef(adUserId, 'received')
              .orderBy('createdAt')
              .startAfter(waterMarks?.received ? waterMarks.received : 0)
              .endAt(adLastReceivedTime)
              .where('transmit', '==', true)
              .get()
          ).docs
        );
        updatedWaterMarks.received = adLastReceivedTime;
      }

      // Write all the updates as a batch so the ops are all or nothing
      const batch = firestore().batch();
      if (
        waterMarks.authored !== updatedWaterMarks.authored ||
        waterMarks.received !== updatedWaterMarks.received
      ) {
        batch.set(waterMarksDocRef(userId, adUserId), updatedWaterMarks);
      }
      let timestamp = Date.now();
      receivedDocs.forEach((doc) => {
        const message = doc.data() as Message;
        batch.set(messageDocRef(userId, 'received', timestamp), {
          ...message,
          receivedAt: timestamp,
          transmit: false,
          vines: message.vines + 1,
        });
        batch.update(messageDocRef(adUserId, 'authored', message.createdAt), {
          grapes: firebase.firestore.FieldValue.increment(1),
          updatedAt: timestamp,
        });
        timestamp++;
      });
      await batch.commit();
    } catch (err) {
      const errorMessage = 'Error adding advertisement to firestore';
      console.error(errorMessage, err);
      throw Error(`${errorMessage} ${err}`);
    }
  }

  async toggleTransmission(
    messageType: MessageRefType,
    message: Message,
    transmit: boolean
  ): Promise<void> {
    try {
      const userId = await this.getUserId();
      // Authored message docs are saved by the createAt timestamp where
      // as received messages are saved by the receivedAt timestamp.
      const timestamp =
        messageType === 'authored' ? message.createdAt : message.receivedAt;
      messageDocRef(userId, messageType, timestamp).update({
        transmit: transmit,
        updatedAt: timestamp,
      });
    } catch (err) {
      const errorMessage = 'Error toggling transmission';
      console.error(errorMessage, err);
      throw Error(`${errorMessage} ${err}`);
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
      console.error('Err loading user Id', err);
      // TODO: Implement a timeout - possibly even a util retryTillSuccessWithTimeout
      return this.loadUserId();
    }
  }

  private async purgeAll() {
    await AsyncStorage.multiRemove([USER_ID_KEY, PEERS_KEY, MESSAGES_KEY]);
  }
}

const messagesCollectionRef = (userId: string, type: MessageRefType) =>
  firestore().collection('Messagesv1').doc(userId).collection(type);

const messageDocRef = (
  userId: string,
  type: MessageRefType,
  timestamp: number
) =>
  firestore()
    .collection<Message>('Messagesv1')
    .doc(userId)
    .collection(type)
    .doc(String(timestamp));

const advertisementDocRef = (
  userId: string,
  adUserId: string,
  timestamp: number
) =>
  firestore()
    .collection('Ads')
    .doc(userId)
    .collection(adUserId)
    .doc(String(timestamp));

const waterMarksDocRef = (userId: string, adUserId: string) =>
  firestore()
    .collection<WaterMarks>('WaterMarks')
    .doc(userId)
    .collection('marks')
    .doc(adUserId);
