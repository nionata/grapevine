import BluetoothCentral from 'bluetooth/central';
import BluetoothPeripheral from 'bluetooth/peripheral';
import { Storage } from 'storage';

export enum BluetoothMode {
  Scan,
  Advertise,
}

export default class BluetoothManager {
  central: BluetoothCentral;
  peripheral: BluetoothPeripheral;
  tickler: NodeJS.Timer | undefined;

  constructor(storage: Storage) {
    this.central = new BluetoothCentral(storage);
    this.peripheral = new BluetoothPeripheral(storage);
  }

  /**
   * Schedules both the central and peripheral bluetooth tasks to run every n seconds.
   * The device's bluetooth chip actually schedules the actual ble tasks for the radio,
   * so we are just continuously refreshing our task in the queue.
   * @returns
   */
  async start(): Promise<void> {
    const prefix = (message: string) => `BluetoothManager.start: ${message}`;
    // Let's first stop the tasks to clear out any stale advertisements or scans.
    // This will correct the case where the AD format changes, but is still being advertised.
    await this.stop();
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
