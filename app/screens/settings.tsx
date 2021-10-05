import React, { useEffect } from 'react';
import { View, Text, Card, Incubator, Button } from 'react-native-ui-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SettingsScreen() {
  const [messageTransmitText, setMessageText] = React.useState<string | null>(
    null
  );
  const [isEditingMessage, setIsEditingMessage] =
    React.useState<boolean>(false);
  const [messageInput, setMessageInput] = React.useState<string>('');

  const getMessage: () => Promise<string | null> = async () => {
    try {
      const message = await AsyncStorage.getItem('@grapevine_message');
      if (message !== null) {
        setMessageText(message);
      }

      return message;
    } catch (e) {
      console.error(e);

      return null;
    }
  };

  const saveMessage: () => Promise<boolean> = async () => {
    try {
      if (messageInput) {
        await AsyncStorage.setItem('@grapevine_message', messageInput);
      }
      setIsEditingMessage(false);
      console.log('Saved message successfully');
      console.log(
        'message input',
        messageInput,
        'isEditingMessage: ',
        isEditingMessage
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  useEffect(() => {
    getMessage();
  }, []);

  const messageCardContents =
    messageTransmitText !== null && !isEditingMessage ? (
      <View>
        <Text>{messageTransmitText}</Text>
        <Button
          marginT-20
          size={Button.sizes.small}
          backgroundColor="blueviolet"
          label="Edit Message"
          enableShadow
          onPress={() => {
            setIsEditingMessage(true);
            console.log('isEditingMessage', isEditingMessage);
          }}
        />
      </View>
    ) : (
      <View>
        <Incubator.TextField
          value={messageInput}
          label="Message to transmit"
          placeholder="Please set a message"
          onChangeText={setMessageInput}
        />
        <Button
          marginT-20
          backgroundColor="blueviolet"
          label="Set Message"
          size={Button.sizes.small}
          onPress={saveMessage}
        />
      </View>
    );

  return (
    <View padding-20>
      <Card padding-20>{messageCardContents}</Card>
    </View>
  );
}

export default SettingsScreen;
