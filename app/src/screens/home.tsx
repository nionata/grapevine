import React from 'react';
import { Card, Text, View } from 'react-native-ui-lib';
import { Message } from 'storage';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

function HomeScreen(props: {
  messages: Message[];
  refreshMessages: () => Promise<void>;
  toggleTransmission: (message: Message) => Promise<void>;
}) {
  const { messages } = props;

  const renderItem: ListRenderItem<Message> = ({ item }) => {
    const formattedDate = format(
      new Date(item.createdAt),
      'MMM d, yyyy h:m aaa'
    );

    return (
      <Card paddingV-5 paddingH-5 marginH-10 marginV-10 activeOpacity={1}>
        <Text>{item.content}</Text>
        <View row>
          <Text style={styles.date}>{formattedDate}</Text>
          <Ionicons
            style={styles.grapeIcon}
            name={`heart${item.transmit ? '' : '-outline'}`}
            color="blueviolet"
            size={20}
            onPress={async () => {
              await props.toggleTransmission(item);
              await props.refreshMessages();
            }}
          />
        </View>
      </Card>
    );
  };

  return <FlatList data={messages} renderItem={renderItem} />;
}

const styles = StyleSheet.create({
  date: {
    color: 'lightgray',
  },
  grapeIcon: {
    textAlign: 'right',
  },
});

export default HomeScreen;
