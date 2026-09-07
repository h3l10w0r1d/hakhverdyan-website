import { useAdminT } from "../../context/AdminI18nContext";

export default function AdminLangSwitch({ className = "" }) {
  const { lang, setLang } = useAdminT();
  return (
    <div className={"admin-lang-switch " + className} role="group" aria-label="Language">
      <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
      <button type="button" className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>RU</button>
    </div>
  );
}
