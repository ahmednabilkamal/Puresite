import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "../assets/locales/ar.json";
import en from "../assets/locales/en.json";
// import { applyNativeLayoutDirection, isAppRTL } from "./rtl";
import { storage } from "./storage";

const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

// Initial setup with default, will be updated in _layout.tsx
i18n.use(initReactI18next).init({
  resources,
  lng: "ar",
  fallbackLng: "en",
  supportedLngs: ["ar", "en"],
  nonExplicitSupportedLngs: true,
  // load: "languageOnly",
  cleanCode: true,
  interpolation: {
    escapeValue: false,
  },
});

export const initLanguage = async () => {
  const savedLanguage = await storage.getItem("language");
  if (savedLanguage && savedLanguage !== i18n.language) {
    await i18n.changeLanguage(savedLanguage);
  }
  // await applyNativeLayoutDirection(isAppRTL(i18n));
};

export default i18n;
