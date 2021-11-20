import { BleManager, Device } from 'react-native-ble-plx'
import { GRAPEVINE_MESSAGE, GRAPEVINE_SERVICE_NAME, GRAPEVINE_SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID } from 'Const'
import { Message } from 'api/message'
import { fromByteArray } from 'base64-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default class BluetoothCentral {
  manager: BleManager
  poweredOn: boolean
  peers: Set<Device>

  constructor() {
    this.manager = new BleManager()
    this.poweredOn = false
    this.peers = new Set()
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

      AsyncStorage.getItem(GRAPEVINE_MESSAGE).then(message => {
        console.log(`Transmitting message '${message}' to device ${device.id}`)
        device.connect().then((device) => {
          const byteArr = Message.encode(Message.fromJSON({
            content: message
          })).finish()
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
      })

      this.peers.add(device)
    })
  }
}