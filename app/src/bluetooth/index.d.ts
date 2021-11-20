import { Message } from 'api/message'
import { Device } from 'react-native-ble-plx'

export type GetMessages = () => Message[]
export type SetMessage = (message: Message) => void

export interface Peer {
  device: Device
  encounters: number
  transmissions: number
}
export type Peers = { [key: string]: Peer }
export type GetPeers = () => Peers
export type SetPeer = (id: string, peer: Peer) => void