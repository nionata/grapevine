import { BleManager, Device } from 'react-native-ble-plx'
import { GRAPEVINE_SERVICE_NAME, GRAPEVINE_SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID } from 'Const'
import { GetMessages } from 'bluetooth'
import { Message } from 'api/message'
import { fromByteArray } from 'base64-js'

export default class BluetoothCentral {
  manager: BleManager
  poweredOn: boolean
  peers: Set<Device>
  getMessages: GetMessages

  constructor(getMessages: GetMessages) {
    this.manager = new BleManager()
    this.poweredOn = false
    this.peers = new Set()
    this.getMessages = getMessages
  }

  startScanning() {
    if (this.poweredOn) {
      this.scanAndConnect()
      return
    }
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        this.poweredOn = true
        this.scanAndConnect()
        subscription.remove()
      } else {
        this.poweredOn = false
      }
    }, true)
  }

  private scanAndConnect() {
    this.manager.startDeviceScan([GRAPEVINE_SERVICE_UUID], null, (error, device) => {
      if (error) {
        console.error(error)
        return
      } else if (!device) {
        console.error('Device not found?')
        return
      }

      // Probably don't need this since we are already only scanning for the UUID
      if (device.name != GRAPEVINE_SERVICE_NAME) {
        return
      }

      // If we see a known peer skip interacting with them for now. Once v1 hits 
      // we will record this interaction.
      if (this.peers.has(device)) {
        return
      }
      console.log(device.id, device.name)

      const messages = this.getMessages()
      if (messages.length == 0) {
        console.log('No messages to transmit. Skipping device.')
        return
      }
      const byteArr = Message.encode(
        messages.pop() || Message.fromJSON({})
      ).finish()

      device.connect().then((device) => {
        // For now we will write w/o a response. We can think more about our posture 
        // towards guaranteed delivery later.
        device.writeCharacteristicWithoutResponseForService(
          GRAPEVINE_SERVICE_UUID, 
          MESSAGE_CHARACTERISTIC_UUID,
          fromByteArray(byteArr)
        ).then(characteristic => {
          console.log(characteristic)
        })
      })

      this.peers.add(device)
    })
  }
}