import { BleManager } from 'react-native-ble-plx'
import { GRAPEVINE_MESSAGE, GRAPEVINE_SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID } from 'Const'
import { Message } from 'api/message'
import { fromByteArray } from 'base64-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GetPeers, Peer, SetPeer } from 'bluetooth'

export default class BluetoothCentral {
  manager: BleManager
  poweredOn: boolean
  getPeers: GetPeers
  setPeer: SetPeer

  constructor(getPeers: GetPeers, setPeer: SetPeer) {
    this.manager = new BleManager()
    this.poweredOn = false
    this.getPeers = getPeers
    this.setPeer = setPeer
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

      // Log a new encounter for an existing or new peer
      const peer: Peer = this.getPeers()[device.id] || {
        device,
        encounters: 0,
        transmissions: 0,
      }
      peer.encounters++
      this.setPeer(device.id, peer)
  
      // Retrieve the user's message and transmit it
      AsyncStorage.getItem(GRAPEVINE_MESSAGE).then(message => {
        console.log(`Transmitting message '${message}'`)
        const byteArr = Message.encode(Message.fromJSON({
          content: message
        })).finish()
        device.connect()
          .then((device) => {
            console.log('Connected to device', device.id)
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            peer.transmissions++
            console.log(peer)
            this.setPeer(device.id, peer)
            return this.manager.writeCharacteristicWithResponseForDevice(
              device.id, 
              GRAPEVINE_SERVICE_UUID, 
              MESSAGE_CHARACTERISTIC_UUID,
              fromByteArray(byteArr)
            )
          })
          .then(characteristic => {
            // console.log(characteristic)
          })
          .catch(err => {
            console.log(err)
          })
      })
    })
  }
}