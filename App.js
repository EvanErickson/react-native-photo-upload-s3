import { withAuthenticator } from 'aws-amplify-react-native'
import Amplify, { Storage } from 'aws-amplify'
import config from './src/aws-exports'
// import awsconfig from './aws-exports';
// Might need to switch line 7 to awsconfig 
Amplify.configure(config)

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function App() {

  Storage.put('test.txt', 'File content', {
    progressCallback(progress) {
        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
  },
});


  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default withAuthenticator(App)