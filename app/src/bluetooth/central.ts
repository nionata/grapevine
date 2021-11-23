import { BleError, BleManager, Device } from 'react-native-ble-plx';
import {
  GRAPEVINE_SERVICE_UUID,
  USER_ID_CHARACTERISTIC_UUID,
} from 'bluetooth/const';
import { Peer, Task } from 'bluetooth';
import { Storage } from 'storage';
import { TextDecoder } from 'web-encoding';
import { toByteArray } from 'base64-js';

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
    scannedDevice: Device | null
  ) {
    try {
      if (error) {
        console.error(error);
        return;
      } else if (!scannedDevice) {
        console.error('Device not found?');
        return;
      }

      const textDecoder = new TextDecoder('utf-8');
      const value = textDecoder.decode(
        toByteArray(scannedDevice.localName as string)
      );
      console.log(value);
      console.log(scannedDevice.id, scannedDevice.localName);

      // Log a new encounter for an existing or new peer
      const peers = await this.storage.getPeers();
      let peer: Peer = peers[scannedDevice.id]
        ? peers[scannedDevice.id]
        : {
            device: scannedDevice,
            encounters: 0,
            transmissions: 0,
            rssi: 0,
            mtu: 0,
          };
      peer.encounters++;
      peer.rssi = scannedDevice.rssi;
      peer.mtu = scannedDevice.mtu;
      console.log(
        `Discovered device '${peer.device.id}' (${peer.encounters} / ${peer.transmissions})`
      );
      await this.storage.setPeer(scannedDevice.id, peer);

      // Before writing to a service characteristc, we must connect and explicitly discover
      // all available options.
      const connectedDevice = await scannedDevice.connect();
      console.log(`Connected to device '${connectedDevice.id}'`);
      const discoveredDevice =
        await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log(
        `Discovered services ${discoveredDevice.serviceUUIDs} on device ${discoveredDevice.id}`
      );
      await discoveredDevice.readCharacteristicForService(
        GRAPEVINE_SERVICE_UUID,
        USER_ID_CHARACTERISTIC_UUID
      );
      console.log(`Read userId froms device '${discoveredDevice.id}'`);
      await this.storage.setPeer(scannedDevice.id, peer);
    } catch (err) {
      console.error(err);
    }
  }
}
