import BluetoothCentral from 'bluetooth/central'
import BluetoothPeripheral from 'bluetooth/peripheral'
import { GetMessages, GetPeers, GetTransmittableMessages, SetMessage, SetPeer } from 'bluetooth'

export enum BluetoothMode {
  Scan,
  Advertise,
}

export default class BluetoothManager {
  mode: BluetoothMode
  central: BluetoothCentral
  peripheral: BluetoothPeripheral
  tickler: NodeJS.Timer | undefined

  constructor(
    getMessages: GetMessages,
    getTransmittableMessages: GetTransmittableMessages,
    setMessage: SetMessage,
    getPeers: GetPeers,
    setPeer: SetPeer,
  ) {
    this.mode = BluetoothMode.Advertise
    this.central = new BluetoothCentral(getPeers, setPeer, getTransmittableMessages)
    this.peripheral = new BluetoothPeripheral(getMessages, setMessage)
  }

  /**
   * Schedules both the central and peripheral bluetooth tasks to run every n seconds.
   * The device's bluetooth chip actually schedules the actual ble tasks for the radio,
   * so we are just continuously refreshing our task in the queue.
   * @returns
   */
  async start(): Promise<void> {
    console.log(`Scheduling bluetooth tasks`)
    this.tickler = setInterval(async () => {
      try {
        // Make sure both tasks aren't transmitting
        await this.central.run()
        console.log('Bluetooth central task is running')
        await this.peripheral.run()
        console.log('Bluetooth peripheral task is running')
      } catch (err) {
        console.error(err)
      }
    }, 5 * 1000)
  }

  /**
   * Clears the task scheduler and stops both task managers.
   * @return
   */
  async stop(): Promise<void> {
    if (this.tickler) {
      clearInterval(this.tickler)
    }
    await this.central.stop()
    await this.peripheral.stop()
  }
}
