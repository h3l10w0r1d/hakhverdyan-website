import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchSettings, fetchLocations } from "../lib/api";
import { localized } from "../lib/localized";
import { FacebookIcon, InstagramIcon, WhatsappIcon, TiktokIcon } from "../lib/icons";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const [settings, setSettings] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    fetchLocations().then(setLocations).catch(() => {});
  }, []);

  const phone = settings?.phone || "+374 60 770 700";
  const phoneHref = "tel:" + phone.replace(/[^\d+]/g, "");
  const hoursWeekday = settings ? localized(settings, "hours_weekday", lang) : "";
  const hoursSaturday = settings ? localized(settings, "hours_saturday", lang) : "";

  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="logo" to="/"><img className="logo-mark" src="/brand/logo-full.png" alt="Hakhverdyan Holding" width="55" height="46" /></Link>
            <p>{t("footer.tagline")}</p>
          </div>
          <div className="footer-col">
            <h4>{t("footer.company")}</h4>
            <ul>
              <li><Link to="/about">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/services">{t("nav.services")}</Link></li>
              <li><Link to="/blog">{t("footer.blog")}</Link></li>
              <li><Link to="/contacts?subject=careers">{t("footer.careers")}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t("footer.products")}</h4>
            <ul>
              <li><Link to="/catalog?cat=profiles">{t("footer.aluminumPvcProfiles")}</Link></li>
              <li><Link to="/catalog?cat=hardware">{t("footer.hardware")}</Link></li>
              <li><Link to="/catalog?cat=sheets">{t("footer.sheets")}</Link></li>
              <li><Link to="/catalog?cat=facades">{t("footer.glassFacades")}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t("footer.contact")}</h4>
            <ul>
              <li><Link to="/contacts">{t("footer.getInTouch")}</Link></li>
              {locations.map(loc => <li key={loc.id}>{localized(loc, "address", lang)}</li>)}
              <li><a href={phoneHref}>{phone}</a></li>
              <li>{hoursWeekday}{hoursWeekday && hoursSaturday ? ", " : ""}{hoursSaturday}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>{t("footer.copyright")}</div>
          <div className="footer-social">
            {settings?.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>}
            {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>}
            {settings?.tiktok_url && <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TiktokIcon /></a>}
            {settings?.whatsapp && <a href={"https://wa.me/" + settings.whatsapp.replace(/[^\d]/g, "")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsappIcon /></a>}
          </div>
        </div>
      </div>
    </footer>
  );
}
