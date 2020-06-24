import React, {Component} from 'react';
import {Platform, AsyncStorage, StyleSheet, Alert, View} from 'react-native';
import {WebView} from 'react-native-webview';
import firebase from 'react-native-firebase';

const isAndroid = Platform.OS === 'android';

try {
  const draftJsHtml = require('./dist/index.html');
  var indexfile = isAndroid ? 'file:///android_asset/index.html' : draftJsHtml;
  console.log(indexfile);
} catch (error) {
  console.log(error);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

class App extends Component {
  [x: string]: any;
  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }
  componentWillUnmount() {
    // this.messageListener();
    this.notificationListener();
    this.notificationOpenedListener();
  }
  notificationOpenedListener() {
    throw new Error('Method not implemented.');
  }
  notificationListener() {
    throw new Error('Method not implemented.');
  }
  async createNotificationListeners() {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const {title, body} = notification;
        this.showAlert(title, body);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        const {title, body} = notificationOpen.notification;
        this.showAlert(title, body);
      });
    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const {title, body} = notificationOpen.notification;
      this.showAlert(title, body);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
      console.log(message);
      console.log(JSON.stringify(message));
    });
  }

  showAlert(title: string, body: string) {
    Alert.alert(
      title,
      body,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: true},
    );
  }
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log(fcmToken);
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      console.log(fcmToken);
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <WebView
          source={{uri: indexfile}}
          keyboardDisplayRequiresUserAction={false} //ios
          automaticallyAdjustContentInsets={false}
          allowFileAccessFromFileURLs={true}
          scalesPageToFit={false}
          mixedContentMode={'always'}
          javaScriptEnabled={true}
          startInLoadingState={true}
          onMessage={event => {
            console.log(event.nativeEvent.data);
          }}
          onLoad={() => {}}
        />
      </View>
    );
  }
}

export default App;
