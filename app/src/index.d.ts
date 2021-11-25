import { Message } from 'storage';
import { Peers } from 'bluetooth';

interface AppProps {}

interface AppState {
  messages: Message[];
  peers: Peers;
  isInitializing: boolean;
}
