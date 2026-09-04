// Web fallback mock for @react-native-google-signin/google-signin
export const GoogleSignin = {
  configure: () => {},
  hasPlayServices: async () => true,
  signIn: async () => {
    throw new Error('Đăng nhập Google trực tiếp chưa hỗ trợ trên Web. Vui lòng chọn "Tiếp tục với tư cách khách".');
  },
  signOut: async () => {},
  isSignedIn: async () => false,
  getCurrentUser: async () => null,
};

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

export default { GoogleSignin, statusCodes };
