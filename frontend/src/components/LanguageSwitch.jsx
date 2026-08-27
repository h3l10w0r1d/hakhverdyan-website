import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hy", label: "ՀԱՅ" },
];

export default function LanguageSwitch({ className = "" }) {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage?.startsWith("hy") ? "hy" : "en";

  return (
    <div className={"lang-switch " + className}>
      {LANGS.map(l => (
        <button
          key={l.code}
          className={"lang-switch-btn" + (current === l.code ? " active" : "")}
          onClick={() => i18n.changeLanguage(l.code)}
          aria-label={`Switch to ${l.label}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
