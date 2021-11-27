import { Message } from 'storage';
import { Peers } from 'bluetooth';

interface AppProps {}

interface AppState {
  messages: {
    authored: Message[];
    received: Message[];
  };
  peers: Peers;
  isInitializing: boolean;
}
