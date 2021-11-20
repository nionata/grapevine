import BluetoothCentral from 'bluetooth/central'
import BluetoothPeripheral from 'bluetooth/peripheral'
import { GetMessages, SetMessage } from 'bluetooth'

export enum BluetoothMode {
  Scan,
  Advertise,
}

export default class BluetoothManager {
  mode: BluetoothMode
  central: BluetoothCentral
  peripheral: BluetoothPeripheral

  constructor(
    mode: BluetoothMode, 
    getMessages: GetMessages, 
    setMessage: SetMessage,
  ) {
    this.mode = mode
    this.central = new BluetoothCentral(getMessages)
    this.peripheral = new BluetoothPeripheral(getMessages, setMessage)
  }

  async start() {
    console.log('Starting bluetooth manager')
    if (this.mode == BluetoothMode.Scan) {
      this.central.startScanning()
    } else if (this.mode == BluetoothMode.Advertise) {
      await this.peripheral.startAdvertising()
    }
  }
}

