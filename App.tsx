import React, {Component} from 'react';
import {Platform, StyleSheet, Alert, View} from 'react-native';
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
  checkPermission() {
    var self = this;
     return new Promise(function(resolve,reject){
        firebase.messaging().hasPermission().then(function(enable){
          if (enable) {
            self.getToken().then(function(value){
              resolve(value);
            }).catch(function(err){
              console.log('permission rejected');
              reject();
            })
          } else {
            self.requestPermission().then(function(value){
              resolve(value);
            }).catch(function(err){
              console.log('permission rejected');
              reject();
            })
          }
        })
    })
    
  }

  async getToken() {
    var self = this;
    return new Promise(function(resolve,reject){
      let fcmToken = self.fcmToken
      if (!fcmToken) {
      firebase.messaging().getToken().then(function(value){
          if (value) {
            // user has a device token
            self.fcmToken = value;
            console.log(value);
            resolve(value);
          }
        })
        .catch(function(err){
          console.log('permission rejected');
          reject();
        })
        
      }
    })
    
  }

  requestPermission() {
    var self = this;
    return new Promise(function(resolve,reject){
      try {
        firebase.messaging().requestPermission().then(function(){
          self.getToken().then(function(value){
            return resolve(value);
          })
        })
        // User has authorised
      } catch (error) {
        // User has rejected permissions
        console.log('permission rejected');
        reject();
      }
    })
    
  }

  render() {
    return (
      <View style={styles.container}>
        <WebView
          source={{uri: indexfile}}
          ref={(webView) => this.webView = webView}
          keyboardDisplayRequiresUserAction={false} //ios
          automaticallyAdjustContentInsets={false}
          allowFileAccessFromFileURLs={true}
          scalesPageToFit={false}
          mixedContentMode={'always'}
          javaScriptEnabled={true}
          startInLoadingState={true}
          onMessage={event => {
            var data = JSON.parse(event.nativeEvent.data);
            var self = this;
            switch(data.name){
              case "getUserToken":
                if(self.fcmToken===undefined){
                  self.checkPermission().then(function(value){
                    const clientResponseCode = `
                    window.postMessage(${JSON.stringify({name:"getUserToken", token:value})}, "*");
                    true;
                    `;
                    if (self.webView) {
                      self.webView.injectJavaScript(clientResponseCode);
                    }
                  });
                }
                else{
                  const clientResponseCode = `
                    window.postMessage(${JSON.stringify({name:"getUserToken",token:self.fcmToken})}, "*");
                    true;
                  `;
                  if (self.webView) {
                    self.webView.injectJavaScript(clientResponseCode);
                  }
                }

                
                break;
              case "saveDomain":

                break;
            }
          }}
          onLoad={() => {}}
        />
      </View>
    );
  }
}

export default App;
