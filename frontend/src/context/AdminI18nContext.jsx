import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hakhverdyan_admin_lang";
const FALLBACK = "en";

// Every file under lib/adminLocales/<lang>/*.js is a namespace, auto-discovered —
// drop in a new `en/foo.js` + `ru/foo.js` pair and `t("foo.bar")` resolves it,
// no shared index to edit.
const enModules = import.meta.glob("../lib/adminLocales/en/*.js", { eager: true });
const ruModules = import.meta.glob("../lib/adminLocales/ru/*.js", { eager: true });

function buildDict(modules) {
  const dict = {};
  for (const path in modules) {
    const name = path.match(/([^/]+)\.js$/)[1];
    dict[name] = modules[path].default;
  }
  return dict;
}

const DICTS = { en: buildDict(enModules), ru: buildDict(ruModules) };

function resolve(dict, key) {
  return key.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), dict);
}

const AdminI18nContext = createContext(null);

export function AdminI18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return saved === "ru" ? "ru" : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const value = useMemo(() => {
    function t(key, vars) {
      const str = resolve(DICTS[lang], key) ?? resolve(DICTS[FALLBACK], key) ?? key;
      if (typeof str !== "string" || !vars) return str;
      return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{{${k}}}`, v), str);
    }
    return { lang, setLang: setLangState, t };
  }, [lang]);

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminT() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) throw new Error("useAdminT must be used within AdminI18nProvider");
  return ctx;
}
