const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable all platforms
config.resolver.platforms = ['ios', 'android', 'web'];

// Custom resolver for cross-platform harmony
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'react-native') {
      return {
        filePath: require.resolve('react-native-web'),
        type: 'sourceFile',
      };
    }
    if (moduleName.includes('ReactNativePrivateInterface')) {
      return {
        filePath: path.resolve(__dirname, 'shims/web/react-native-private-interface.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'react-native-maps') {
      return {
        filePath: path.resolve(__dirname, 'shims/web/react-native-maps.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === '@react-native-firebase/auth') {
      return {
        filePath: path.resolve(__dirname, 'shims/web/firebase-auth.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === '@react-native-firebase/app') {
      return {
        filePath: path.resolve(__dirname, 'shims/web/firebase-app.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === '@react-native-google-signin/google-signin') {
      return {
        filePath: path.resolve(__dirname, 'shims/web/google-signin.js'),
        type: 'sourceFile',
      };
    }
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
