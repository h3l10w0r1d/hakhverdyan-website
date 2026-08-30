import { PinIcon } from "../lib/icons";

// Yandex's free map-widget embed — no API key needed for a single placemark.
export default function YandexMap({ lat, lng, zoom = 16, label }) {
  if (lat == null || lng == null) {
    return (
      <div className="location-map">
        <div className="location-map-grid"></div>
        <span className="pin"><PinIcon /></span>
      </div>
    );
  }

  const src = `https://yandex.com/map-widget/v1/?ll=${lng}%2C${lat}&z=${zoom}&pt=${lng},${lat},pm2rdl`;

  return (
    <div className="location-map has-map">
      <iframe
        src={src}
        title={label || "Map"}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
