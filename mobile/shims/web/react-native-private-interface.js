import { Platform } from 'react-native-web';

module.exports = {
  Platform,
  RCTEventEmitter: { register: () => {} },
  ReactNativeViewConfigRegistry: { customBubblingEventTypes: {}, customDirectEventTypes: {} },
  TextInputState: {},
  UIManager: {},
  deepDiffer: () => false,
  flattenStyle: (style) => style,
};
