/// <reference types="@capacitor/local-notifications" />

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.opora.mobile",
  appName: "Опора",
  webDir: "out",
  backgroundColor: "#F7FAF7",
  loggingBehavior: "debug",
  zoomEnabled: false,
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      style: "DEFAULT",
      hidden: false,
      animation: "NONE",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_opora",
      iconColor: "#2F7D68",
      presentationOptions: ["banner", "list", "sound"],
    },
  },
  ios: {
    backgroundColor: "#F7FAF7",
    contentInset: "never",
  },
  android: {
    backgroundColor: "#F7FAF7",
    allowMixedContent: false,
  },
};

export default config;
