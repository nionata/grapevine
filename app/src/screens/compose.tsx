import React, { createRef } from 'react';
import { StyleSheet, TextInput, Text } from 'react-native';
import { TextField, Button, View } from 'react-native-ui-lib';
import { cleanUpSwearyString } from 'swears';
import FirestoreStorage from '../storage/firestore';

const storage = new FirestoreStorage();

const ComposeModal = (props: { requestClose: () => void }) => {
  const inputRef = createRef<TextInput>();
  const [messageInput, setMessageInput] = React.useState<string>('');

  const saveMessage: () => Promise<boolean> = async () => {
    try {
      if (messageInput) {
        // Censor the message before we save it
        const cleanedInput = cleanUpSwearyString(messageInput);
        setMessageInput(cleanedInput);

        await storage.setMessage({
          content: cleanedInput,
          userId: 'joemomma',
          createdAt: 1234,
        });

        props.requestClose();
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <View style={styles.messageInputContainer}>
      <TextField
        autoFocus={true}
        multiline={true}
        ref={inputRef}
        style={styles.messageInput}
        value={messageInput}
        placeholder="Share something through the grapevine..."
        onChangeText={setMessageInput}
        maxLength={255}
      />
      <Text style={styles.messageLength}>{messageInput.length} / 255</Text>

      <Button
        marginT-10
        backgroundColor="blueviolet"
        label="Submit"
        size={Button.sizes.medium}
        onPress={saveMessage}
      />

      <Button
        marginT-10
        backgroundColor="lightgray"
        label="Discard"
        size={Button.sizes.medium}
        onPress={props.requestClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  messageInputContainer: {
    display: 'flex',
    width: '100%',
    paddingHorizontal: 20,
  },
  messageInput: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageLength: {
    color: 'lightgray',
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 20,
  },
});

export default ComposeModal;
