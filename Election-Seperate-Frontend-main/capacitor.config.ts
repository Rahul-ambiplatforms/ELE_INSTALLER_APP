import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.espvmukti.app',
  appName: 'ESP-Vmukti',
  webDir: 'build',
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
  server: {
    cleartext: false, 
    url:"https://esp.vmukti.com",
  },
};

export default config;