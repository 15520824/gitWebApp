import React, {Component} from 'react';
import {Platform, StyleSheet, Alert, View, AppState, AppRegistry, NativeModules, BackHandler} from 'react-native';
import {WebView} from 'react-native-webview';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';

const isAndroid = Platform.OS === 'android';

try {
  const draftJsHtml = require('./dist/index.html');
  var indexfile = isAndroid ? {uri:'file:///android_asset/index.html'} : draftJsHtml;
  // console.log(indexfile);
} catch (error) {
  // console.log(error);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

// const channel = new firebase.notifications.Android.Channel(
//   'reminder19001080',
//   'reminder19001080',
//   firebase.notifications.Android.Importance.Max
//   ).setDescription("Used for getting reminder notification");
// firebase.notifications().android.createChannel(channel);


function displayNotification(notification: { notificationId: string; title: string; subtitle: string; body: string; moredata: any; data: any; })
{
  return new Promise(function(resolve,reject){
    if (Platform.OS === 'android') {
      const localNotification = new firebase.notifications.Notification()
          .setNotificationId(notification.notificationId)
          .setTitle(notification.title)
          .setSubtitle(notification.subtitle)
          .setBody(notification.body)
          .setData({moredata: notification.moredata})
          .android.setChannelId('reminder19001080') // e.g. the id you chose above
          .android.setColor('#ff0000') // you can set a color here
          .android.setAutoCancel(true)
          .android.setPriority(firebase.notifications.Android.Priority.High);
      firebase.notifications()
          .displayNotification(localNotification)
          .then(function(){
            resolve(localNotification)
          })
          .catch(err => {reject(err)});
    } else {
        const localNotification = new firebase.notifications.Notification()
            .setNotificationId(notification.notificationId)
            .setTitle(notification.title)
            .setSubtitle(notification.subtitle)
            .setBody(notification.body)
            .setData(notification.data)
            .ios.setBadge(1);

        firebase.notifications()
            .displayNotification(localNotification)
            .then(function(){
              resolve(localNotification)
            })
            .catch(err => {reject(err)});
    }
  })

}


class App extends Component {
  [x: string]: any;
  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.checkPermission();
    this.createNotificationListeners();
  }
  componentWillUnmount() {
    // this.messageListener();
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
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
      .onNotification(async notification => {
        // console.log("abc", notification);
        const clientResponseCode = `
          window.postMessage(${JSON.stringify({name:"checkShowNotiChat",value:  {
            notificationId: notification.notificationId,
            title: notification.title,
            body: notification.body,
            moredata: notification.data.moredata
          }})}, "*");
          true;
        `;

        if (this.webView) {
          this.webView.injectJavaScript(clientResponseCode);
        }
      });
    this.notificationListener = firebase
      .notifications().onNotificationOpened(notificationOpen => {
        const notification = notificationOpen.notification;
        console.log(notification);
        const clientResponseCode = `
        window.postMessage(${JSON.stringify({name: "openchatMobile", value: notification.data.moredata})}, "*");
        true;
      `;
        this.webView.injectJavaScript(clientResponseCode);
    });
    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        var notification = notificationOpen.notification;
        console.log("background" + 1111111, notification);

        this.clickNotiChatFuncClose(notification.data.moredata);
      });
    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      var notification = notificationOpen.notification;
      console.log("closed" + 1111111, notification);
      this.clickNotiChatFuncClose(notification.data.moredata);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
      // console.log(message);
      console.log(JSON.stringify(message));
    });
  }

  clickNotiChatFuncClose(moredata: string, count = 0) {
    var self = this;
    if (self.webView) {
      const clientResponseCode = `
        if(window.loadEvent === true){
          window.postMessage(${JSON.stringify({name: "openchatMobile", value: moredata})}, "*");
        }
        else {
          var x = setInterval(function(){
            if (window.loadEvent === true){
              window.postMessage(${JSON.stringify({name: "openchatMobile", value: moredata})}, "*");
              clearInterval(x);
            }
          }, 100);
        }
        true;
      `;

      self.webView.injectJavaScript(clientResponseCode);

    }
    else {
      if (count == 100){
          Alert.alert(
            "Failed",
            "Error load webview",
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: true},
      );
        return;
      }
      setTimeout(function(){
        self.clickNotiChatFuncClose(moredata, ++count);
      }, 100);
    }
  }
  checkPermission() {
    var self = this;
     return new Promise(function(resolve, reject){
        firebase.messaging().hasPermission().then(function(enable){
          if (enable) {
            self.getToken().then(function(value){
              resolve(value);
            }).catch(function(err){
              console.log('permission rejected',err);
              reject();
            })
          } else {
            self.requestPermission().then(function(value){
              resolve(value);
            }).catch(function(err){
              console.log('permission rejected',err);
              reject();
            })
          }
        })
    })

  }

  async getToken() {
    var self = this;
    return new Promise(function(resolve, reject){
      AsyncStorage.getItem("fcmToken").then(function(value){
        let fcmToken = value;
        if (!fcmToken) {
          firebase.messaging().getToken().then(function(value){
              if (value) {
                // user has a device token
                self.fcmToken = value;
                AsyncStorage.setItem("fcmToken", value).then(function(){
                  resolve(value);
                });
              }
            })
            .catch(function(err){
              console.log('permission rejected',err);
              reject();
            })
          }
          else {
            self.fcmToken = value;
          }
      })

    })

  }

  requestPermission() {
    var self = this;
    return new Promise(function(resolve, reject){
      try {
        firebase.messaging().requestPermission().then(function(){
          self.getToken().then(function(value){
            return resolve(value);
          })
        })
        // User has authorised
      } catch (error) {
        // User has rejected permissions
        console.log('permission rejected',error);
        reject();
      }
    })

  }

  checkBackApp(){
      var self = this;
      if (self.webView) {
          const clientResponseCode = `
          window.postMessage(${JSON.stringify({name: "checkBackApp", value: ""})}, "*");
          true;
          `;
        self.webView.injectJavaScript(clientResponseCode);
      }
      else {
          BackHandler.exitApp();
      }
  };
  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  handleBackButtonClick(){
      this.checkBackApp();
      return true;
  }

  saveStorage = async (name: string,value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e) {
      // saving error
    }
  }

  getStorage = async (name: string) => {
    try {
      const value = await AsyncStorage.getItem(name)
      return value;
    } catch(e) {
      // error reading value
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <WebView
          source={indexfile}
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
            case "removeAllNotification":
                NativeModules.myBaseJavaModule.removeAllNotification();
                break;
            case "removeNotificationBySessionid":
                NativeModules.myBaseJavaModule.removeNotificationBySessionid();
                break;
              case "getUserToken":
                if(self.fcmToken===undefined){
                  self.checkPermission().then(function(value){
                    const clientResponseCode = `
                    window.postMessage(${JSON.stringify({name: "getUserToken", value: value})}, "*");
                    true;
                    `;
                    if (self.webView) {
                      self.webView.injectJavaScript(clientResponseCode);
                    }
                  });
                }
                else{
                  const clientResponseCode = `
                    window.postMessage(${JSON.stringify({name: "getUserToken", value: self.fcmToken})}, "*");
                    true;
                  `;
                  if (self.webView) {
                    self.webView.injectJavaScript(clientResponseCode);
                  }
                }


                break;
              case "saveDomain":
                var promiseall = [];
                promiseall.push(self.saveStorage(data.value.domain.name, data.value.domain.value));
                promiseall.push(self.saveStorage(data.value.token.name, data.value.token.value));
                Promise.all(promiseall).then(function(){
                  const clientResponseCode = `
                    window.postMessage(${JSON.stringify({name: "saveDomain", value: true})}, "*");
                    true;
                  `;
                  if (self.webView) {
                    self.webView.injectJavaScript(clientResponseCode);
                  }
                }).catch(function(err){
                  console.log(err);
                  const clientResponseCode = `
                    window.postMessage(${JSON.stringify({name: "saveDomain", value: false})}, "*");
                    true;
                  `;
                  if (self.webView) {
                    self.webView.injectJavaScript(clientResponseCode);
                  }
                });
                break;
              case "getDomain":
                self.getStorage(data.value).then(function(value){
                  const clientResponseCode = `
                    window.postMessage(${JSON.stringify({name: "getDomain", value: value})}, "*");
                    true;
                  `;
                  if (self.webView) {
                    self.webView.injectJavaScript(clientResponseCode);
                  }
                });
                break;
              case "reload":
                if (self.webView) {
                  self.webView.reload();
                }
                break;
              case "pushNotification":
                displayNotification(data.value);
                break;
              case "getStatusApp":
                  const clientResponseCode = `
                  window.postMessage(${JSON.stringify({name: "getStatusApp", value: AppState.currentState})}, "*");
                  true;
                `;
                if (self.webView) {
                  self.webView.injectJavaScript(clientResponseCode);
                }
                break;
            case "backApp":
                BackHandler.exitApp();
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
