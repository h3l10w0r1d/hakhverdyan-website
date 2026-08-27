import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import hy from "./locales/hy.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hy: { translation: hy },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "hy"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "hakhverdyan_lang",
    },
    interpolation: { escapeValue: false },
  });

function syncHtmlLang(lng) {
  document.documentElement.lang = lng?.startsWith("hy") ? "hy" : "en";
}
syncHtmlLang(i18n.resolvedLanguage);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
