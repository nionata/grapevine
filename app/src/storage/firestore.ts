import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from 'api/message';
import { Peer, Peers } from 'bluetooth';
import { MessageFilter, Storage } from 'storage';
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
      let documents: FirebaseFirestoreTypes.QuerySnapshot<Message>;
      if (filter === 'authored') {
        console.log(
          'looking for messages with user ID: ',
          typeof this.userId,
          ' bah humbug'
        );
        documents = await firestore()
          .collection<Message>('Messages')
          .where('userId', '==', await this.getUserId())
          .orderBy('createdAt', 'desc')
          .get();
      } else {
        documents = await firestore()
          .collection<Message>('Messages')
          .orderBy('createdAt', 'desc')
          .get();
      }

      const messages: Message[] = [];
      documents.forEach((documentSnapshot) => {
        messages.push({
          ...documentSnapshot.data(),
          id: documentSnapshot.id,
        });
      });

      return messages;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async setMessage(content: string): Promise<boolean> {
    try {
      await this.userIdLoaded;
      await firestore().collection('Messages').add({
        content,
        userId: this.userId,
        createdAt: Date.now(),
      });
      console.log('Message saved to firestore');
      return true;
    } catch (err) {
      console.error('Error adding msg to firestore', err);
      return false;
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
