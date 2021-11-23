import React from 'react';
import { Card, Text } from 'react-native-ui-lib';
import { Message } from 'api/message';
import { FlatList } from 'react-native';

function HomeScreen(props: { messages: Message[] }) {
  return (
    <FlatList
      data={props.messages}
      renderItem={({ item }) => (
        <Card paddingV-5 paddingH-5 marginH-10 marginV-10 activeOpacity={1}>
          <Text>{item.content}</Text>
        </Card>
      )}
    />
  );
}

export default HomeScreen;
