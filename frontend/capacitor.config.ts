import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.badmintonstarz.app',
  appName: 'Badminton Starz',
  webDir: 'dist',
  // When running as a native APK, calls go to the Render backend
  // Change this URL to your actual Render backend URL after deploying
  server: {
    // Remove this 'url' line to use bundled web assets (fully offline UI)
    // url: 'https://shuttlestats-api.onrender.com',
    androidScheme: 'https',
    cleartext: true,   // allow HTTP during local testing
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#06150A',
      showSpinner: false,
    },
  },
};

export default config;
