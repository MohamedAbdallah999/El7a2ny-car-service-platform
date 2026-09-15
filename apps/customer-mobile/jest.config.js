module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(?:@react-native|@react-navigation)\\+|react-native(?:-|@))',
    'node_modules/(?!\\.pnpm|((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-safe-area-context|react-native-screens)/)',
  ],
};
