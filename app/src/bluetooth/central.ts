import { BleError, BleManager, Device } from 'react-native-ble-plx';
import { GRAPEVINE_SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID } from 'Const';
import { Messages } from 'api/message';
import { fromByteArray } from 'base64-js';
import {
  GetPeers,
  GetTransmittableMessages,
  Peer,
  SetPeer,
  Task,
} from 'bluetooth';

export default class BluetoothCentral implements Task {
  poweredOn: boolean;
  private manager: BleManager;
  private getPeers: GetPeers;
  private setPeer: SetPeer;
  private getTransmittableMessages: GetTransmittableMessages;

  constructor(
    getPeers: GetPeers,
    setPeer: SetPeer,
    getTransmittableMessages: GetTransmittableMessages
  ) {
    this.poweredOn = false;
    this.manager = new BleManager();
    this.getPeers = getPeers;
    this.setPeer = setPeer;
    this.getTransmittableMessages = getTransmittableMessages;
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

      // Log a new encounter for an existing or new peer
      const peers = this.getPeers();
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
      this.setPeer(scannedDevice.id, peer);

      // Encode the applicable messages
      const messages = await this.getTransmittableMessages();
      console.log(`Transmitting messages '${messages}'`);
      const messagesByteArr = Messages.encode(
        Messages.fromJSON({
          messages: messages,
        })
      ).finish();

      // Before writing to a service characteristc, we must connect and explicitly discover
      // all available options.
      const connectedDevice = await scannedDevice.connect();
      console.log(`Connected to device '${connectedDevice.id}'`);
      const discoveredDevice =
        await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log(
        `Discovered services ${discoveredDevice.serviceUUIDs} on device ${discoveredDevice.id}`
      );
      const characterisc =
        await discoveredDevice.writeCharacteristicWithResponseForService(
          GRAPEVINE_SERVICE_UUID,
          MESSAGE_CHARACTERISTIC_UUID,
          fromByteArray(messagesByteArr)
        );
      peer.transmissions++;
      console.log(`Transmitted messages to device '${discoveredDevice.id}'`);
      this.setPeer(scannedDevice.id, peer);
    } catch (err) {
      console.error(err);
    }
  }
}
