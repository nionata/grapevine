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
    getMessages: GetMessages, 
    setMessage: SetMessage,
  ) {
    this.mode = BluetoothMode.Advertise
    this.central = new BluetoothCentral()
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
}
