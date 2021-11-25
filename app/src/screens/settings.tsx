import React, { useEffect } from 'react';
import { View, Text, Card, Switch, Button } from 'react-native-ui-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ProfileProps } from './profile';
import { Peers } from 'bluetooth';

function SettingsScreen(props: { peers: Peers }, { navigation }: ProfileProps) {
  const [isTransmitting, setIsTransmitting] = React.useState<boolean>(true);

  const getIsTranmittingSetting: () => Promise<void> = async () => {
    try {
      const shouldTransmit =
        (await AsyncStorage.getItem('@grapevine_is_transmitting')) === 'true';
      setIsTransmitting(shouldTransmit);
    } catch (e) {
      console.error(e);
    }
  };

  const saveIsTransmittingSetting: (shouldTransmit: boolean) => Promise<void> =
    async (shouldTransmit) => {
      await AsyncStorage.setItem(
        '@grapevine_is_transmitting',
        shouldTransmit ? 'true' : 'false'
      );
      setIsTransmitting(shouldTransmit);
    };

  useEffect(() => {
    getIsTranmittingSetting();
  }, []);

  const otherSettingsCardContents = (
    <View>
      <Text style={styles.cardHeader} marginB-10>
        Transmission Settings
      </Text>
      <View row centerV>
        <Switch
          onColor={'blueviolet'}
          offColor={'lightgray'}
          value={isTransmitting}
          onValueChange={saveIsTransmittingSetting}
          marginR-10
        />
        <Text>Transmit Message</Text>
      </View>
      <View paddingT-10>
        <Text color={'gray'}>
          Controls whether your message will be transmitted to other GrapeVine
          users.
        </Text>
      </View>
    </View>
  );

  const statsCardContents = (
    <View>
      <View centerV>
        <Text style={styles.cardHeader} marginB-10>
          Stats
        </Text>
        <Text>
          <Text style={styles.bold}>20</Text>: Number of message transmissions
        </Text>
      </View>
    </View>
  );

  return (
    <View padding-20>
      <Button
        marginB-10
        backgroundColor="blueviolet"
        label="Back"
        size={Button.sizes.medium}
        onPress={() => navigation.navigate('ProfileHome')}
      >
        <Ionicons style={styles.white} name="chevron-back" />
      </Button>
      <Card padding-20>{otherSettingsCardContents}</Card>
      <Card marginT-20 padding-20>
        {statsCardContents}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  white: {
    color: 'white',
  },
});

export default SettingsScreen;
