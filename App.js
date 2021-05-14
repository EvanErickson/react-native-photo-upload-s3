import React, { useState, useEffect } from 'react';
import { withAuthenticator } from 'aws-amplify-react-native'
import { StyleSheet, Text, View, Button, Clipboard, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import Auth from '@aws-amplify/auth';
import Storage from '@aws-amplify/storage';
import Amplify from '@aws-amplify/core';
import awsconfig from './src/aws-exports';
Amplify.configure(awsconfig);

function App() {
  const [image, setImage] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const [name, setName] = useState('')

  console.log(Auth.response);

  async function signOut() {
    try {
        await Auth.signOut();
        console.log(Auth.response)
    } catch (error) {
        console.log('error signing out: ', error);
    }
  }

  //Ran on load to ask permissions for Camera / Photo Library 
  useEffect(() => {
    (async () => {
      if (Constants.platform.ios) {
        const cameraRollStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (
          cameraRollStatus.status !== 'granted' ||
          cameraStatus.status !== 'granted'
        ) {
          alert('Sorry, we need these permissions to make this work!');
        }
      }
    })();
  }, []);

  //Funcion that takes photo
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'Images',
      aspect: [4, 3],
    });
    this.handleImagePicked(result);
  };

  //Function that uses Image Picker to select from library
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      aspect: [4, 3],
      quality: 1,
    });
    this.handleImagePicked(result);
  };

  handleImagePicked = async (pickerResult) => {
    try {
      if (pickerResult.cancelled) {
        alert('Upload cancelled');
        return;
      } else {
        setPercentage(0);
        const img = await fetchImageFromUri(pickerResult.uri);
        const uploadUrl = await uploadImage(`${name} - ${new Date()}`, img);
        downloadImage(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed');
    }
  };

  uploadImage = (filename, img) => {
    Auth.currentCredentials();
    // Maybe insert a filename=`${Date.now()}-${file.name}`
    return Storage.put(filename, img, {
      level: 'public',
      contentType: 'image/jpeg',
      progressCallback(progress) {
        setLoading(progress);
      },
    })
      .then((response) => {
        console.log(response)
        return response.key;
      })
      .catch((error) => {
        console.log(error);
        return error.response;
      });
  };

  const setLoading = (progress) => {
    const calculated = parseInt((progress.loaded / progress.total) * 100);
    updatePercentage(calculated); // due to s3 put function scoped
  };

  const updatePercentage = (number) => {
    setPercentage(number);
  };

  // Can use this for fetching images from json?
  downloadImage = (uri) => {
    Storage.get(uri)
      .then((result) => setImage(result))
      .catch((err) => console.log(err));
  };

  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const copyToClipboard = () => {
    //I'm pretty sure image is stored as a url and they are just setting the clipboard to a url string
    Clipboard.setString(image);
    // maybe insert a state function here so that the image url can get saved and somehow referenced / sent to dynamo.
    alert('Copied image URL to clipboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DJ0 Upload Profile Photo</Text>
      {percentage !== 0 && <Text style={styles.percentage}>{percentage}%</Text>}

      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="Full Name"
      />


      {image && (
        <View>
          <Text style={styles.result} onPress={copyToClipboard}>
            <Image
              source={{ uri: image }}
              style={{ width: 250, height: 250 }}
            />
          </Text>
          <Text style={styles.info}>Long press to copy the image url</Text>
        </View>
      )}

      <Button onPress={pickImage} title='Pick an image from camera roll' />
      <Button onPress={takePhoto} title='Take a photo' />
      <Button onPress={() => {
        setImage(null)
        setName('')
        setPercentage(0)
      }} title='Done' />
      <Button title="Sign Out" style={styles.moreInfo} onPress={() => {
          signOut();
        }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  percentage: {
    marginBottom: 10,
  },
  result: {
    paddingTop: 5,
  },
  info: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: '65%',
    margin: 12,
    borderWidth: 1,
    padding: 10
  },
});

export default withAuthenticator(App)