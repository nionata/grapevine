import React, { useState } from 'react';
import { View, Text, Card } from 'react-native-ui-lib';
import { BleManager, Device } from 'react-native-ble-plx';

function ScanScreen() {
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const manager = new BleManager();

  const startScanning = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      } else if (!device) {
        console.error('Device not found?');
        return;
      }

      if (discoveredDevices.filter((d) => d.id === device.id).length < 1) {
        setDiscoveredDevices([...discoveredDevices, device]);
      }
    });
  };

  const subscription = manager.onStateChange((state) => {
    if (state === 'PoweredOn') {
      startScanning();
    } else {
      subscription.remove();
    }
  });

  const deviceCards = discoveredDevices.map((device, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>Name: {device.name}</Text>
      <Text>ID: {device.id}</Text>
      <Text>manufacturerData: {device.manufacturerData}</Text>
    </Card>
  ));

  const cardContents =
    discoveredDevices.length > 0 ? deviceCards : <Text>No Devices found.</Text>;

  return <View padding-20>{cardContents}</View>;
}

export default ScanScreen;
