import React from 'react';
import { View, Card, Text } from 'react-native-ui-lib';
import { Message } from 'api/message';

function HomeScreen(props: { messages: Message[] }) {
  const messageCards = props.messages.map((message, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>{message.content}</Text>
    </Card>
  ));

  return <View padding-20>{messageCards}</View>;
}

export default HomeScreen;
