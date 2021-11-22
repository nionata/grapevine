import React from 'react';
import { Card, Text } from 'react-native-ui-lib';
import { ScrollView } from 'react-native';
import { Messages } from 'storage';

function HomeScreen(props: { messages: Messages }) {
  const messageCards = Object.values(props.messages).map((message, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>{message.content}</Text>
      <Text>From {message.userId}</Text>
      <Text>{new Date(message.createdAt).toISOString()}</Text>
    </Card>
  ));

  return <ScrollView padding-20>{messageCards}</ScrollView>;
}

export default HomeScreen;
