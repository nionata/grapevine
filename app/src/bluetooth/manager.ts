import BluetoothCentral from 'bluetooth/central';
import BluetoothPeripheral from 'bluetooth/peripheral';
import {
  GetMessages,
  GetPeers,
  GetTransmittableMessages,
  SetMessage,
  SetPeer,
} from 'bluetooth';

export enum BluetoothMode {
  Scan,
  Advertise,
}

export default class BluetoothManager {
  central: BluetoothCentral;
  peripheral: BluetoothPeripheral;
  tickler: NodeJS.Timer | undefined;

  constructor(
    getMessages: GetMessages,
    getTransmittableMessages: GetTransmittableMessages,
    setMessage: SetMessage,
    getPeers: GetPeers,
    setPeer: SetPeer
  ) {
    this.central = new BluetoothCentral(
      getPeers,
      setPeer,
      getTransmittableMessages
    );
    this.peripheral = new BluetoothPeripheral(getMessages, setMessage);
  }

  /**
   * Schedules both the central and peripheral bluetooth tasks to run every n seconds.
   * The device's bluetooth chip actually schedules the actual ble tasks for the radio,
   * so we are just continuously refreshing our task in the queue.
   * @returns
   */
  async start(): Promise<void> {
    const prefix = (message: string) => `BluetoothManager.start: ${message}`;
    console.log(prefix('Scheduling bluetooth tasks'));
    const taskRunner = async () => {
      try {
        console.log(prefix('Tickler running tasks'));
        await this.central.run();
        await this.peripheral.run();
      } catch (err) {
        console.error(err);
      }
    };
    this.tickler = setInterval(taskRunner, 10 * 1000);
    await taskRunner();
  }

  /**
   * Clears the task scheduler and stops both task managers.
   * @return
   */
  async stop(): Promise<void> {
    if (this.tickler) {
      clearInterval(this.tickler);
    }
    await this.central.stop();
    await this.peripheral.stop();
  }
}
