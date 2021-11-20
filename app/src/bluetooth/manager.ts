import BluetoothPeripheral, { GetMessages, SetMessage } from 'bluetooth/peripheral'

export enum BluetoothMode {
  Scan,
  Advertise,
}

export default class BluetoothManager {
  mode: BluetoothMode
  // central: BleManager
  peripheral: BluetoothPeripheral

  constructor(
    mode: BluetoothMode, 
    getMessages: GetMessages, 
    setMessage: SetMessage,
  ) {
    this.mode = mode
    // this.central = new BleManager()
    this.peripheral = new BluetoothPeripheral(getMessages, setMessage)
  }

  async start() {
    console.log('Starting bluetooth manager')
    if (this.mode == BluetoothMode.Scan) {
      // this.central.startScanning()
    } else if (this.mode == BluetoothMode.Advertise) {
      await this.peripheral.startAdvertising()
    }
  }
}

