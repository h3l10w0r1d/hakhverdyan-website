import { Link } from "react-router-dom";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "../lib/icons";

export default function Footer() {
  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="logo" to="/"><span className="dot"></span>HAKHVERDYAN</Link>
            <p>Building materials, hardware, and installation services for aluminum, PVC, and glass systems in Yerevan.</p>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Products</h4>
            <ul>
              <li><Link to="/catalog?cat=profiles">Aluminum &amp; PVC Profiles</Link></li>
              <li><Link to="/catalog?cat=hardware">Hardware</Link></li>
              <li><Link to="/catalog?cat=sheets">Sheets</Link></li>
              <li><Link to="/catalog?cat=facades">Glass Facades</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><Link to="/contacts">Get in touch</Link></li>
              <li>Griboedov 56 st., Yerevan</li>
              <li>Tevosyan 7/11 st., Yerevan</li>
              <li><a href="tel:+37460770700">+374 60 770 700</a></li>
              <li>Mon–Fri 9:00–18:00, Sat 9:00–16:00</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Hakhverdyan Shinmontazh. All rights reserved.</div>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><FacebookIcon /></a>
            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#" aria-label="WhatsApp"><WhatsappIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
