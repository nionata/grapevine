import { BleError, BleManager, Device } from 'react-native-ble-plx';
import {
  GRAPEVINE_SERVICE_UUID,
  USER_ID_CHARACTERISTIC_UUID,
} from 'bluetooth/const';
import { Task } from 'bluetooth';
import { Storage } from 'storage';
import { decode } from 'bluetooth/encoding';
export default class BluetoothCentral implements Task {
  poweredOn: boolean;
  private manager: BleManager;
  private storage: Storage;

  constructor(storage: Storage) {
    this.poweredOn = false;
    this.manager = new BleManager();
    this.storage = storage;
  }

  /**
   * Begins scanning for grapevine service @GRAPEVINE_SERIVCE_UUID advertisements
   * @returns
   */
  async run(): Promise<void> {
    const successMessage = 'BluetoothCentral.run: Started scanning';
    const listener = (e: BleError | null, d: Device | null) =>
      this.handleDeviceScan(e, d);
    if (this.poweredOn) {
      this.manager.startDeviceScan([GRAPEVINE_SERVICE_UUID], null, listener);
      console.log(successMessage);
      return;
    }
    const subscription = this.manager.onStateChange(async (state) => {
      if (state === 'PoweredOn') {
        this.poweredOn = true;
        this.manager.startDeviceScan([GRAPEVINE_SERVICE_UUID], null, listener);
        console.log(successMessage);
        subscription.remove();
      } else {
        this.poweredOn = false;
      }
    }, true);
  }

  /**
   * Stops scanning and destroys the manager instance
   * @returns
   */
  async stop(): Promise<void> {
    this.poweredOn = false;
    this.manager.stopDeviceScan();
    this.manager.destroy();
  }

  /**
   * On a device scan event log the encounter and attempt to transmit messages
   * @param error
   * @param scannedDevice
   * @returns
   */
  private async handleDeviceScan(
    error: BleError | null,
    device: Device | null
  ) {
    try {
      if (error) {
        console.error(error);
        return;
      } else if (!device) {
        return;
      }
      console.log(
        `found device: ${device.id} ${device.localName} ${device.rssi} ${device.mtu}`
      );
      // If the local name is not set or the local name does not decode (ie. it's not base64 encoded), then
      // we can ignore this device scan as we are only looking for devices advertising our AD.
      if (!device.localName) {
        return;
      }
      const userId = decode(device.localName);
      if (!userId) {
        return;
      }
      // TODO: set a new encounter for this device
      console.log(`encountered userId ${userId}`);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Connect to a scanned device and discover the available services and characteritstics. From there a read request will
   * be sent to retrieve the user id from associated characteristic.
   * @param {Device}
   * @returns {Promise<string}
   * @deprecated - As of v1, we are going to grab the user id directly from the local name in the advertisement data.
   */
  private async discoverAndReadCharacteristic(
    scannedDevice: Device
  ): Promise<string> {
    try {
      // Before writing to a service characteristc, we must connect and explicitly discover all available options
      const connectedDevice = await scannedDevice.connect();
      console.log(`Connected to device '${connectedDevice.id}'`);
      const discoveredDevice =
        await connectedDevice.discoverAllServicesAndCharacteristics();
      // The value will be loaded into the returned characteristic object
      const characteristic =
        await discoveredDevice.readCharacteristicForService(
          GRAPEVINE_SERVICE_UUID,
          USER_ID_CHARACTERISTIC_UUID
        );
      const userId = decode(characteristic.value as string);
      console.log(`Read userId ${userId} from device '${discoveredDevice.id}'`);
      return userId;
    } catch (err) {
      console.log(err);
    }
    return '';
  }
}
