// Web fallback mock for @react-native-firebase/auth
const mockAuth = () => ({
  currentUser: null,
  signOut: async () => {},
  signInWithCredential: async () => {},
  onAuthStateChanged: (callback) => {
    callback(null);
    return () => {};
  },
});

mockAuth.GoogleAuthProvider = {
  credential: () => ({}),
};

export default mockAuth;
