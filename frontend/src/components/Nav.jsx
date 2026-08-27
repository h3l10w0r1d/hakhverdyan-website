import { NavLink, Link } from "react-router-dom";
import MagnetButton from "./MagnetButton";

const LINKS = [
  { to: "/about", label: "About" },
  { to: "/catalog", label: "Catalog" },
  { to: "/services", label: "Services" },
  { to: "/blog", label: "Blog" },
  { to: "/contacts", label: "Contacts" },
];

export default function Nav() {
  return (
    <header>
      <div className="nav-inner" id="navInner">
        <Link className="logo" to="/">
          <span className="dot"></span>HAKHVERDYAN
        </Link>
        <nav>
          <ul>
            {LINKS.map(link => (
              <li key={link.label}>
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to={link.to}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <MagnetButton as="button" className="nav-cta">Request Quote</MagnetButton>
      </div>
    </header>
  );
}
