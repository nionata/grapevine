import React from 'react';
import { Card, Text } from 'react-native-ui-lib';
import { Message } from 'storage';
import { FlatList, StyleSheet } from 'react-native';
import { format } from 'date-fns';

function HomeScreen(props: { messages: Message[] }) {
  const messages = props.messages.map((message) => {
    return {
      ...message,
      createdAt: format(new Date(message.createdAt), 'MMM d, yyyy h:m aaa'),
    };
  });

  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => (
        <Card paddingV-5 paddingH-5 marginH-10 marginV-10 activeOpacity={1}>
          <Text>{item.content}</Text>
          <Text style={styles.date}>{item.createdAt}</Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  date: {
    color: 'lightgray',
  },
});

export default HomeScreen;
