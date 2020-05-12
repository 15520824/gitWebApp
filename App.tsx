import React, {Component} from 'react';
import {Platform} from 'react-native';
import {WebView} from 'react-native-webview';
const isAndroid = Platform.OS === 'android';
try {
  const draftJsHtml = require('./dist/index.html');
  var indexfile = isAndroid ? 'file:///android_asset/index.html' : draftJsHtml;
} catch (error) {
  console.log(error);
}

class App extends Component {
  render() {
    return (
      <WebView
        source={{uri: indexfile}}
        keyboardDisplayRequiresUserAction={false}
        originWhitelist={['*']}
      />
    );
  }
}

export default App;
