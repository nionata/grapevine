import React, { useEffect } from 'react';
import {
  View,
  Text,
  Card,
  Incubator,
  Button,
  Switch,
} from 'react-native-ui-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cleanUpSwearyString } from 'swears';

function SettingsScreen() {
  const [messageTransmitText, setMessageText] = React.useState<string | null>(
    null
  );
  const [isEditingMessage, setIsEditingMessage] =
    React.useState<boolean>(false);
  const [messageInput, setMessageInput] = React.useState<string>('');
  const [isTransmitting, setIsTransmitting] = React.useState<boolean>(true);

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
        // Censor the message before we save it
        const cleanedInput = cleanUpSwearyString(messageInput);
        setMessageInput(cleanedInput);
        setMessageText(cleanedInput);
        await AsyncStorage.setItem('@grapevine_message', cleanedInput);
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

  const getIsTranmittingSetting: () => Promise<void> = async () => {
    try {
      const shouldTransmit =
        (await AsyncStorage.getItem('@grapevine_is_transmitting')) === 'true';
      setIsTransmitting(shouldTransmit);
    } catch (e) {
      console.error(e);
    }
  };

  const saveIsTransmittingSetting: (shouldTransmit: boolean) => Promise<void> =
    async (shouldTransmit) => {
      await AsyncStorage.setItem(
        '@grapevine_is_transmitting',
        shouldTransmit ? 'true' : 'false'
      );
      setIsTransmitting(shouldTransmit);
    };

  useEffect(() => {
    getMessage();
    getIsTranmittingSetting();
  }, []);

  const editMessageCardContents =
    messageTransmitText !== null && !isEditingMessage ? (
      <View>
        <Text>{messageTransmitText}</Text>
        <Button
          marginT-20
          size={Button.sizes.small}
          backgroundColor="blueviolet"
          label="Edit Message"
          enableShadow
          onPress={() => setIsEditingMessage(true)}
        />
        <Text color={'gray'} marginT-10>
          This is the message that will be transmitted to other GrapeVineusers.
        </Text>
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
          marginT-10
          backgroundColor="blueviolet"
          label="Set Message"
          size={Button.sizes.small}
          onPress={saveMessage}
        />
        <Text color={'gray'} marginT-10>
          This is the message that will be transmitted to other GrapeVineusers.
        </Text>
      </View>
    );

  const otherSettingsCardContents = (
    <View>
      <View row centerV>
        <Switch
          onColor={'blueviolet'}
          offColor={'lightgray'}
          value={isTransmitting}
          onValueChange={saveIsTransmittingSetting}
          marginR-10
        />
        <Text>Transmit Message</Text>
      </View>
      <View paddingT-10>
        <Text color={'gray'}>
          Controls whether your message will be transmitted to other GrapeVine
          users.
        </Text>
      </View>
    </View>
  );

  const statsCardContents = (
    <View>
      <View row centerV />
    </View>
  );

  return (
    <View padding-20>
      <Card padding-20>{editMessageCardContents}</Card>
      <Card marginT-20 padding-20>
        {otherSettingsCardContents}
      </Card>
    </View>
  );
}

export default SettingsScreen;
