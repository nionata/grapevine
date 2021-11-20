import { Message } from "api/message"
import { Peers } from "bluetooth"
import BluetoothManager from "bluetooth/manager"

interface AppProps {
}

interface AppState {
  manager: BluetoothManager
  messages: Message[]
  peers: Peers
}