import Manager from 'react-native-peripheral/lib/Manager';
import { Service, Characteristic } from 'react-native-peripheral';
import {
  GRAPEVINE_SERVICE_NAME,
  GRAPEVINE_SERVICE_UUID,
  MESSAGE_CHARACTERISTIC_UUID,
} from 'bluetooth/const';
import { Message, Messages } from 'api/message';
import { toByteArray, fromByteArray } from 'base64-js';
import { GetMessages, SetMessage, Task } from 'bluetooth';

export default class BluetoothPeripheral implements Task {
  poweredOn: boolean;
  private manager: Manager;
  private service: Service;

  constructor(getMessages: GetMessages, setMessage: SetMessage) {
    this.poweredOn = false;
    this.manager = new Manager();
    this.service = new Service({
      uuid: GRAPEVINE_SERVICE_UUID,
      characteristics: [this.messageCharacteristic(getMessages, setMessage)],
    });
  }

  /**
   * Begins advertisement of the grapevine service @GRAPEVINE_SERVICE_UUID with
   * the configured characteristics
   * @returns
   */
  async run(): Promise<void> {
    const prefix = (message: string) => `BluetoothPeripheral.run: ${message}`;
    if (await this.manager.isAdvertising()) {
      console.log(prefix('Already advertising'));
      return;
    }
    const advertisement = {
      name: GRAPEVINE_SERVICE_NAME,
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
        await this.manager.addService(this.service);
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
   * @param getMessages
   * @param setMessage
   * @returns
   */
  private messageCharacteristic(
    getMessages: GetMessages,
    setMessage: SetMessage
  ): Characteristic {
    return new Characteristic({
      uuid: MESSAGE_CHARACTERISTIC_UUID,
      properties: ['read', 'write'],
      permissions: ['readable', 'writeable'],
      onReadRequest: async (offset?: number) => {
        const byteArr = Messages.encode(
          Messages.fromJSON({ messages: getMessages() })
        ).finish();
        return fromByteArray(byteArr);
      },
      onWriteRequest: async (value: string, offset?: number) => {
        for (let message of Messages.decode(toByteArray(value)).messages) {
          setMessage(message);
        }
      },
    });
  }
}
