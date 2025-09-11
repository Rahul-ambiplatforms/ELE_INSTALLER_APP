import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vesp.app',
  appName: 'ESP-Vmukti',
  webDir: 'build',
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
  server: {
    cleartext: true, 
    url:"https://starfish-app-q44cz.ondigitalocean.app/",
  },
};

export default config;