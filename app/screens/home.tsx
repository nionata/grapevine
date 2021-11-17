import React from 'react';
import { View, Card, Text } from 'react-native-ui-lib';
import { Messages, Message } from '@api/message';

const messages: Messages = {
  'messages': [
    Message.fromJSON({
      'content': 'Here\'s a message I collected. Grapevine is dope!',
    }),
    Message.fromJSON({
      'content': 'Here\'s another message I collected. I think Grapevine is okay, but we need to get more people on.',
    }),
    Message.fromJSON({
      'content': 'Nick, can you hear me?',
    })
  ]
}

function HomeScreen() {
  const messageCards = messages.messages.map((message, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>{message.content}</Text>
    </Card>
  ));

  return <View padding-20>{messageCards}</View>;
}

export default HomeScreen;
 