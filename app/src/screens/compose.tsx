import React, { createRef, ForwardedRef } from 'react';
import { StyleSheet, TextInput, Text } from 'react-native';
import Modal from 'react-native-modalbox';
import { TextField, Button, View } from 'react-native-ui-lib';
import { cleanUpSwearyString } from 'swears';

const ComposeModal = React.forwardRef<Modal>(
  (props, ref: ForwardedRef<Modal>) => {
    const inputRef = createRef<TextInput>();
    const [messageInput, setMessageInput] = React.useState<string>('');

    const onOpen = () => {
      // Don't need this anymore with autofocus={true}
      // // inputRef.current?.focus();
    };

    const requestClose = () => {
      // This is so ugly but it works
      (ref as React.RefObject<Modal>)?.current?.close();
    };

    const onClose = () => {
      setMessageInput('');
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

    return (
      <Modal
        ref={ref}
        style={styles.modal}
        swipeToClose={true}
        onOpened={onOpen}
        onClosed={onClose}
      >
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
            onPress={requestClose}
          />
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modal: {
    alignItems: 'center',
    width: undefined,
    height: undefined,
    flex: 1,
    paddingTop: 100,
  },
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
