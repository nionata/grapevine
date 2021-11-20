import BluetoothCentral from 'bluetooth/central'
import BluetoothPeripheral from 'bluetooth/peripheral'
import { GetMessages, GetPeers, SetMessage, SetPeer } from 'bluetooth'

export enum BluetoothMode {
  Scan,
  Advertise,
}

export default class BluetoothManager {
  mode: BluetoothMode
  central: BluetoothCentral
  peripheral: BluetoothPeripheral

  constructor(
    getMessages: GetMessages, 
    setMessage: SetMessage,
    getPeers: GetPeers,
    setPeer: SetPeer
  ) {
    this.mode = BluetoothMode.Advertise
    this.central = new BluetoothCentral(getPeers, setPeer)
    this.peripheral = new BluetoothPeripheral(getMessages, setMessage)
  }

  async start(mode: BluetoothMode) {
    this.mode = mode
    console.log(`Starting bluetooth manager in ${BluetoothMode[mode]} mode`)
    if (mode == BluetoothMode.Scan) {
      this.central.startScanning()
    } else if (mode == BluetoothMode.Advertise) {
      await this.peripheral.startAdvertising()
    }
  }

  async destroy() {
    this.central.manager.stopDeviceScan()
    this.central.manager.destroy()
    await this.peripheral.manager.stopAdvertising()
    await this.peripheral.manager.removeAllServices()
  }
}
