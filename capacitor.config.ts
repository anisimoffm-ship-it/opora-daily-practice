/// <reference types="@capacitor/local-notifications" />

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.opora.mobile",
  appName: "Опора",
  webDir: "out",
  backgroundColor: "#0A0F24",
  loggingBehavior: "debug",
  zoomEnabled: false,
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      style: "DARK",
      hidden: false,
      animation: "NONE",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_opora",
      iconColor: "#7AD6C9",
      presentationOptions: ["banner", "list", "sound"],
    },
  },
  ios: {
    backgroundColor: "#0A0F24",
    contentInset: "never",
  },
  android: {
    backgroundColor: "#0A0F24",
    allowMixedContent: false,
  },
};

export default config;
