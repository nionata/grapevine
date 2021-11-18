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
        console.error('Device was null', device);
        return;
      }

      console.log('discovered device', device);

      setDiscoveredDevices([...discoveredDevices, device]);
    });
  };

  manager.onStateChange((state) => {
    if (state === 'PoweredOn') {
      startScanning();
      console.log('starting scanning');
    }
  });

  startScanning();

  const deviceCards = discoveredDevices.map((device, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>Name: {device.name}</Text>
      <Text>ID: {device.id}</Text>
      <Text>manufacturerData: {device.manufacturerData}</Text>
    </Card>
  ));

  return <View padding-20>{deviceCards}</View>;
}

export default ScanScreen;
