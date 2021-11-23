# Grapevine Client App

## Getting Started

The Grapevine app is built with React Native, and is currently targeting only iOS.
To begin local development, follow the [React Native docs](https://reactnative.dev/docs/environment-setup), but there is a short summary below.

### Requirements:

- Ensure Node and Watchman are installed.
- Ensure XCode is installed, along with the XCode Command Line Tools.
- Install an iOS Simulator in XCode (likely there's one provided already)
- Ensure CocoaPods is installed

### Starting local environment:

From the `app` directory:

- Install node dependencies with `npm install`
- Install Cocoapods in the iOS directory with `cd ios && pod install && cd ..`
- Start Metro: `npm run start`
- After Metro has launched, **in a new terminal**, start the application:
  - For iOS: `npm run ios`

## CodePush

[CodePush](https://microsoft.github.io/code-push/) allows for quick releases and hotfixes.

### Usage

Install the cli

```bash
npm install -g appcenter-cli
```
