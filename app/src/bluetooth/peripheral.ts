import Manager from 'react-native-peripheral/lib/Manager';
import { Service, Characteristic } from 'react-native-peripheral';
import {
  GRAPEVINE_SERVICE_UUID,
  MESSAGE_CHARACTERISTIC_UUID,
  USER_ID_CHARACTERISTIC_UUID,
} from 'bluetooth/const';
import { Messages } from 'api/message';
import { Task } from 'bluetooth';
import { Storage } from 'storage';
import { encodeUserId } from 'bluetooth/encoding';
import { fromByteArray, toByteArray } from 'base64-js';

export default class BluetoothPeripheral implements Task {
  poweredOn: boolean;
  private manager: Manager;
  private storage: Storage;
  private adLocalName: string;

  constructor(storage: Storage) {
    this.poweredOn = false;
    this.manager = new Manager();
    this.storage = storage;
    this.adLocalName = '';
  }

  /**
   * Begins advertisement of the grapevine service @GRAPEVINE_SERVICE_UUID with the configured characteristics.
   * @returns
   */
  async run(): Promise<void> {
    const prefix = (message: string) => `BluetoothPeripheral.run: ${message}`;
    if (await this.manager.isAdvertising()) {
      console.log(prefix('Already advertising'));
      return;
    }
    const advertisement = {
      // As of v1, we are able to achieve a connection-less detection scheme by setting the user's id as the local name.
      // This will be available as part of the advertisement packet, which our central manager can read after a scan.
      name: await this.getOrSetAdLocalName(),
      serviceUuids: [GRAPEVINE_SERVICE_UUID],
    };
    const successMessage = prefix('Started advertising');
    if (this.poweredOn) {
      await this.manager.startAdvertising(advertisement);
      console.log(successMessage);
      return;
    }
    // This should only run the first time or when the bluetooth module gets turned off after being on
    const subscription = this.manager.onStateChanged(async (state) => {
      if (state === 'poweredOn') {
        this.poweredOn = true;
        await this.manager.addService(
          new Service({
            uuid: GRAPEVINE_SERVICE_UUID,
            characteristics: [await this.userIdCharacteristic()],
          })
        );
        await this.manager.startAdvertising(advertisement);
        console.log(successMessage);
        subscription.remove();
      } else {
        this.poweredOn = false;
      }
    });
  }

  /**
   * Stops
   * @return
   */
  async stop(): Promise<void> {
    this.poweredOn = false;
    await this.manager.stopAdvertising();
    await this.manager.removeAllServices();
  }

  /**
   * GATT characteristic that on read returns the device's messages and on
   * write appends messages from a peer device.
   * @returns {Characteristic}
   * @deprecated - As of v1, messages are no longer transmitted over bluetooth.
   */
  private messageCharacteristic(): Characteristic {
    return new Characteristic({
      uuid: MESSAGE_CHARACTERISTIC_UUID,
      properties: ['read', 'write'],
      permissions: ['readable', 'writeable'],
      onReadRequest: async (offset?: number) => {
        console.log(`Read offset ${offset}`);
        const byteArr = Messages.encode(
          Messages.fromJSON({ messages: await this.storage.getMessages('all') })
        ).finish();
        return fromByteArray(byteArr);
      },
      onWriteRequest: async (value: string, offset?: number) => {
        console.log(`Write offset ${offset}`);
        for (let message of Messages.decode(toByteArray(value)).messages) {
          await this.storage.setMessage(message.content);
        }
      },
    });
  }

  /**
   * Read-only GATT characteristic that returns the device's user id.
   * @returns {Characteristic}
   */
  private async userIdCharacteristic(): Promise<Characteristic> {
    return new Characteristic({
      uuid: USER_ID_CHARACTERISTIC_UUID,
      value: await this.getOrSetAdLocalName(),
      properties: ['read'],
      permissions: ['readable'],
    });
  }

  private async getOrSetAdLocalName(): Promise<string> {
    if (this.adLocalName === '') {
      this.adLocalName = encodeUserId(await this.storage.getUserId());
    }
    return this.adLocalName;
  }
}
