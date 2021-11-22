import { Peers } from 'bluetooth';
import { Messages } from 'storage';

interface AppProps {}

interface AppState {
  messages: Messages;
  peers: Peers;
}
