import React, { createRef, useEffect } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Modal from 'react-native-modalbox';
import { TextField, Button, View } from 'react-native-ui-lib';
import { cleanUpSwearyString } from 'swears';

const ComposeModal = React.forwardRef<Modal>((props, ref) => {
  const [messageInput, setMessageInput] = React.useState<string>('');

  const onClose = () => {
    console.log('Modal just closed');
  };
  const inputRef = createRef<TextInput>();

  const onOpen = () => {
    console.log('Modal just opened');
  };

  const saveMessage: () => Promise<boolean> = async () => {
    try {
      if (messageInput) {
        // Censor the message before we save it
        const cleanedInput = cleanUpSwearyString(messageInput);
        setMessageInput(cleanedInput);

        // TODO: Send the message to Firestore
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    inputRef.current?.focus();
  });

  return (
    <Modal
      ref={ref}
      style={styles.modal}
      swipeToClose={true}
      onClosed={onClose}
      onOpened={onOpen}
    >
      <View padding-20 paddingT-200>
        <TextField
          ref={inputRef}
          value={messageInput}
          placeholder="Share something through the grapevine..."
          onChangeText={setMessageInput}
        />

        <Button
          marginT-10
          backgroundColor="blueviolet"
          label="Submit"
          size={Button.sizes.medium}
          onPress={saveMessage}
        />
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modal: {
    // justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ComposeModal;
