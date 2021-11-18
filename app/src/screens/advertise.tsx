import React, { useState } from 'react'
import { View, Text, Card } from 'react-native-ui-lib'
import Peripheral, { Service, Characteristic } from 'react-native-peripheral'
import { Message, Messages } from 'api/message'
import { GRAPEVINE_SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID } from '../Const'
import { toByteArray, fromByteArray } from 'base64-js'

function AdvertiseScreen() {
  const [messages, setMessages] = useState<Message[]>([])

  const messagesCharacteristic = new Characteristic({
    uuid: MESSAGE_CHARACTERISTIC_UUID,
    properties: ['read', 'write'],
    permissions: ['readable', 'writeable'],
    onReadRequest: async(offset?: number) => {
      const byteArr = Messages.encode(
        Messages.fromJSON({messages})
      ).finish()
      return fromByteArray(byteArr)
    },
    onWriteRequest: async(value: string, offset?: number) => {
      console.log(offset)
      setMessages([
        ...messages, 
        Message.decode(toByteArray(value))
      ])
    }
  })

  const grapevineService = new Service({
    uuid: GRAPEVINE_SERVICE_UUID,
    characteristics: [messagesCharacteristic]
  })

  Peripheral.onStateChanged(state => {
    if (state === 'poweredOn') {  
      Peripheral.addService(grapevineService).then(() => {
        Peripheral.startAdvertising({
          name: 'Nick\'s BLE device',
          serviceUuids: [GRAPEVINE_SERVICE_UUID],
        })
      })
    }
  })

  const messageCards = messages.map((message, index) => (
    <Card paddingV-5 paddingH-5 marginV-10 activeOpacity={1} key={index}>
      <Text>Name: {message.content}</Text>
      <Text>ID: {message.peripheralId}</Text>
    </Card>
  ))

  return <View padding-20>{}</View>
}

export default AdvertiseScreen
