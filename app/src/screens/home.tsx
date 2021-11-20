import React from 'react';
import { Card, Text } from 'react-native-ui-lib';
import { Message } from 'api/message';
import { ScrollView } from 'react-native';

function HomeScreen(props: { messages: Message[] }) {
  const messageCards = props.messages.map((message, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>{message.content}</Text>
    </Card>
  ));

  return <ScrollView padding-20>{messageCards}</ScrollView>;
}

export default HomeScreen;
