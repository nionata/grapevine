import Manager from 'react-native-peripheral/lib/Manager'
import { Service, Characteristic } from 'react-native-peripheral'
import { GRAPEVINE_SERVICE_NAME, GRAPEVINE_SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID } from '../Const'
import { Message, Messages } from 'api/message'
import { toByteArray, fromByteArray } from 'base64-js'

export type GetMessages = () => Message[]
export type SetMessage = (message: Message) => void

export default class BluetoothPeripheral {
  manager: Manager
  poweredOn: boolean
  private service: Service

  constructor(getMessages: GetMessages, setMessage: SetMessage) {
    this.manager = new Manager()
    this.poweredOn = false

    const messageCharacteristic = new Characteristic({
      uuid: MESSAGE_CHARACTERISTIC_UUID,
      properties: ['read', 'write'],
      permissions: ['readable', 'writeable'],
      onReadRequest: async(offset?: number) => {
        const byteArr = Messages.encode(
          Messages.fromJSON({ messages: getMessages() })
        ).finish()
        return fromByteArray(byteArr)
      },
      onWriteRequest: async(value: string, offset?: number) => {
        setMessage(Message.decode(toByteArray(value)))
      }
    })

    const grapevineService = new Service({
      uuid: GRAPEVINE_SERVICE_UUID,
      characteristics: [messageCharacteristic]
    })

    this.service = grapevineService
  }

  async startAdvertising() {
    if (await this.manager.isAdvertising()) {
      return
    }
    const advertisement = {
      name: GRAPEVINE_SERVICE_NAME,
      serviceUuids: [GRAPEVINE_SERVICE_UUID],
    }
    if (this.poweredOn) {
      this.manager.startAdvertising(advertisement)
      return
    }
    // This should only run the first time or when the bluetooth module gets turned off after being one
    this.manager.onStateChanged(state => {
      if (state === 'poweredOn') {
        this.poweredOn = true
        this.manager.addService(this.service).then(() => {
          this.manager.startAdvertising(advertisement).then(() => {
            console.log('Started advertising')
          })
        })
      } else {
        this.poweredOn = false
      }
    })
  }
}