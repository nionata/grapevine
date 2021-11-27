import React from 'react';
import { View, Text, Card, Button } from 'react-native-ui-lib';

import { ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ProfileProps } from './profile';
import { Peers } from 'bluetooth';
import cardStyles from '../styles/cards';

function PeersCards(peers: Peers | null) {
  if (!peers || Object.keys(peers).length === 0) {
    return <Text>No peer devices found.</Text>;
  }

  const peerValues = Object.values(peers);
  peerValues.sort((a, b) => a.encounters + b.encounters);

  const peersCards = peerValues.map((peer, index) => (
    <Card padding-5 marginB-10 activeOpacity={1} key={index}>
      <Text>Name: {peer.device.name}</Text>
      <Text>Id: {peer.device.id}</Text>
      <Text>Encounters: {peer.encounters}</Text>
      <Text>Transmissions: {peer.transmissions}</Text>
    </Card>
  ));

  return <ScrollView padding-20>{peersCards}</ScrollView>;
}

function SettingsScreen({ navigation, peers }: ProfileProps) {
  const statsCardContents = (
    <View>
      <View centerV>
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

      <Text style={cardStyles.cardHeader}>Stats</Text>
      <Card padding-20>{statsCardContents}</Card>

      <Text style={cardStyles.cardHeader}>Peers</Text>
      <View>{PeersCards(peers)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  white: {
    color: 'white',
  },
});

export default SettingsScreen;
