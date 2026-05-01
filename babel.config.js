module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... otros plugins que puedas tener
      'react-native-reanimated/plugin', // IMPORTANTE: Este debe ser el último plugin
    ],
  };
};
