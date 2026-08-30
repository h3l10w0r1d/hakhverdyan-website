import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckIcon } from "../lib/icons";

export default function AuthVisual({ title, sub, bullets }) {
  const { t } = useTranslation();

  return (
    <div className="auth-visual">
      <img className="auth-visual-photo" src="/hero/facade-render.jpg" alt="" />
      <div className="auth-visual-shade"></div>
      <div className="auth-visual-content">
        <Link className="auth-visual-logo" to="/">
          <img src="/brand/logo-full.png" alt="Hakhverdyan Holding" width="44" height="37" />
        </Link>
        <div className="auth-visual-copy">
          <h2>{title}</h2>
          <p>{sub}</p>
          <ul className="auth-visual-bullets">
            {bullets.map(b => (
              <li key={b}><span className="ic"><CheckIcon size={12} /></span>{b}</li>
            ))}
          </ul>
        </div>
        <div className="auth-visual-stats">
          <div><strong>500+</strong><span>{t("home.statProjects")}</span></div>
          <div><strong>15+</strong><span>{t("home.statYears")}</span></div>
        </div>
      </div>
    </div>
  );
}
