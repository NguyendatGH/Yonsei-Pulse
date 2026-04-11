const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .wasm to the asset extensions to fix expo-sqlite resolution
config.resolver.assetExts.push('wasm');

module.exports = config;
