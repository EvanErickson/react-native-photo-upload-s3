import { withAuthenticator } from 'aws-amplify-react-native'
import Amplify, { Storage } from 'aws-amplify'
import config from './src/aws-exports'
// import awsconfig from './aws-exports';
// Might need to switch line 7 to awsconfig 
Amplify.configure(config)

import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, StyleSheet, Text, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

function App() {
  const [image, setImage] = useState(null)
  const [name, setName] = useState('Evan Erickson')

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result) 
    async function pathToImageFile(data) {
      try {
        const response = await fetch(data);
        const blob = await response.blob();
        await Storage.put(`customers/${name}`, blob, {
          contentType: 'image/jpeg', // contentType is optional
        });
      } catch (err) {
        console.log('Error uploading file:', err);
      }
    }
    pathToImageFile(result.uri);
  }

  return (
    <View style={styles.container}>
      
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Button title="Upload image" onPress={() => {alert(image)}} />
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