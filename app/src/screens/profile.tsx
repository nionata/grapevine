import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Peers } from 'bluetooth';

import ProfileHome from './profileHome';
import SettingsScreen from './settings';

// https:stackoverflow.com/questions/63132548/react-navigation-5-error-binding-element-navigation-implicitly-has-an-any-ty
type RootStackParamList = {
  ProfileHome: undefined; // undefined because you aren't passing any params to the home screen
  Settings: { peers: Peers };
};

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileHome'
>;

export type ProfileProps = {
  navigation: ProfileScreenNavigationProp;
  peers: Peers;
};

function ProfileScreen(props: { peers: Peers }) {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        children={() => <SettingsScreen peers={props.peers} />}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default ProfileScreen;
