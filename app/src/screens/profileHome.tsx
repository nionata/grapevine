import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { View, Text, Card, Switch, Button } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Message } from 'storage';
import FirestoreStorage from 'storage/firestore';

import { ProfileProps } from './profile';
import cardStyles from 'styles/cards';

function ProfileHome({ navigation, peers }: ProfileProps) {
  const storage = new FirestoreStorage();
  const [messages, setMessages] = useState<Message[]>();

  const getMessages: () => Promise<void> = async () => {
    const userMessagesFromFirestore = await storage.getMessages('authored');
    setMessages(userMessagesFromFirestore);
  };

  useEffect(() => {
    // You need to restrict it at some point
    if (!messages || messages.length === 0) {
      getMessages();
    }
  });

  const saveIsTransmittingSetting = async (
    message: Message,
    transmit: boolean
  ): Promise<void> => {
    await storage.toggleTransmission('authored', message, transmit); // set the transmit value
    await getMessages(); // refresh messages
    return;
  };

  return (
    <View padding-20>
      <Button
        marginB-10
        backgroundColor="blueviolet"
        size={Button.sizes.medium}
        onPress={() =>
          navigation.navigate('Settings', {
            peers,
          })
        }
      >
        <Text white>Settings</Text>
        <Ionicons style={styles.white} name="chevron-forward" />
      </Button>

      <Text style={cardStyles.cardHeader}>My Messages</Text>
      <Text style={cardStyles.cardHelpText} marginB-5>
        You can toggle transmitting individual messages on and off as well.
      </Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Card style={cardStyles.card} row centerV>
            <Switch
              onColor={'blueviolet'}
              offColor={'lightgray'}
              value={item.transmit}
              onValueChange={(value: boolean) =>
                saveIsTransmittingSetting(item, value)
              }
              marginR-10
            />
            <Text paddingR-40>{item.content}</Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  white: {
    color: 'white',
  },
  date: {
    color: 'lightgray',
  },
});

export default ProfileHome;
