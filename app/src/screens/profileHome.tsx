import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { View, Text, Card, Switch, Button } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Message } from 'api/message';
import FirestoreStorage from 'storage/firestore';

import { ProfileProps } from './profile';

function ProfileHome({ navigation, peers }: ProfileProps) {
  const storage = new FirestoreStorage();
  const [messages, setMessages] = useState<Message[]>();

  const getMessages: () => Promise<void> = async () => {
    console.log('[PROFILE] - running getMessages');
    const userMessagesFromFirestore = await storage.getMessages('authored');
    setMessages(userMessagesFromFirestore);
  };

  useEffect(() => {
    // You need to restrict it at some point
    // This is just dummy code and should be replaced by actual
    if (!messages) {
      getMessages();
    }
  });

  const saveGlobalTransmitSetting = (shouldTransmit: boolean): void => {
    console.log(
      'saving transmitting setting to ' + shouldTransmit + ' for user: '
    );
  };

  const saveIsTransmittingSetting = (
    messageId: string,
    shouldTransmit: boolean
  ): void => {
    console.log(
      'saving transmitting setting to ' + shouldTransmit + ' for message: ',
      messageId
    );
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
      <Card padding-10 marginB-10>
        <Text bold>Global Transmission</Text>
        <View row centerV>
          <Switch
            onColor={'blueviolet'}
            offColor={'lightgray'}
            value={true}
            onValueChange={(value: boolean) => saveGlobalTransmitSetting(value)}
            marginR-10
          />
          <Text>Transmit all messages</Text>
        </View>
        <View paddingT-10>
          <Text style={styles.date}>
            This setting controls whether all messages should be transmitted.
            Disabling this disables transmission for every message!
          </Text>
        </View>
      </Card>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Card padding-10 marginB-10 activeOpacity={1} row>
            <Switch
              onColor={'blueviolet'}
              offColor={'lightgray'}
              value={true}
              onValueChange={(value: boolean) =>
                saveIsTransmittingSetting(item.id, value)
              }
              marginR-10
            />
            <Text>{item.content}</Text>
            {/* <Text style={styles.date}>{item.createdAt}</Text> */}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    color: 'gray',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  white: {
    color: 'white',
  },
});

export default ProfileHome;
