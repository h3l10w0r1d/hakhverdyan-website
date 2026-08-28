import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FacebookIcon, InstagramIcon, WhatsappIcon, TiktokIcon } from "../lib/icons";

export default function Footer() {
  const { t } = useTranslation();

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
              <li><a href="#">{t("footer.careers")}</a></li>
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
              <li>{t("footer.addr1")}</li>
              <li>{t("footer.addr2")}</li>
              <li><a href="tel:+37460770700">+374 60 770 700</a></li>
              <li>{t("footer.hours")}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>{t("footer.copyright")}</div>
          <div className="footer-social">
            <a href="https://www.facebook.com/share/1ERgBgZy4H/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>
            <a href="https://www.instagram.com/hakhverdyan.holding" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
            <a href="https://www.tiktok.com/@hakhverdyan.holding" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TiktokIcon /></a>
            <a href="https://wa.me/37460770700" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsappIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
