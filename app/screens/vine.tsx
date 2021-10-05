import React from 'react';
import { View, Card, Text } from 'react-native-ui-lib';

const messages: string[] = [
  "Here's a message I collected. Grapevine is dope!",
  "Here's another message I collected. I think Grapevine is okay, but we need to get more people on.",
  'Nick, can you hear me?',
];

function VineScreen() {
  const messageCards = messages.map((message, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>{message}</Text>
    </Card>
  ));

  return <View padding-20>{messageCards}</View>;
}

export default VineScreen;
