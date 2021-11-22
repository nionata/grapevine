import React from 'react';
import { Text, Card } from 'react-native-ui-lib';
import { ScrollView } from 'react-native';
import { Peers } from 'bluetooth';

function PeersScreen(props: { peers: Peers }) {
  const peerValues = Object.values(props.peers);
  peerValues.sort((a, b) => a.encounters + b.encounters);
  const peersCards = peerValues.map((peer, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>Name: {peer.device.name}</Text>
      <Text>Id: {peer.device.id}</Text>
      <Text>Encounters: {peer.encounters}</Text>
      <Text>Transmissions: {peer.transmissions}</Text>
    </Card>
  ));

  const cardContents =
    peerValues.length > 0 ? peersCards : <Text>No Devices found.</Text>;
  return <ScrollView padding-20>{cardContents}</ScrollView>;
}

export default PeersScreen;
