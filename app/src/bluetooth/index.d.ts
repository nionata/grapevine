import { Message } from 'api/message'

export type GetMessages = () => Message[]
export type SetMessage = (message: Message) => void

export enum BluetoothMode {
  Scan,
  Advertise,
}