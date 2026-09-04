// Web fallback mock for @react-native-firebase/app
const mockFirebase = {
  app: () => mockFirebase,
  apps: [],
  initializeApp: () => mockFirebase,
};

export default mockFirebase;
