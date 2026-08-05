import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.isivoltpro.inspecciones",
  appName: "IsiVoltPro Preinspecciones BT",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#061F3E",
      androidSplashResourceName: "splash",
    },
  },
};

export default config;
