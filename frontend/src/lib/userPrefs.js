const UID_KEY = "hakhverdyan_uid";
const CONTACT_KEY = "hakhverdyan_contact_v1";
const PHONE_COUNTRY_KEY = "hakhverdyan_phone_country";

// A stable per-browser identifier, kept in localStorage indefinitely so
// preferences (cart, language, saved contact info) can be tied to the same
// visitor across sessions without requiring an account.
export function getUserId() {
  try {
    let id = localStorage.getItem(UID_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(UID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function loadSavedContact() {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveContact({ name, phone, email }) {
  try {
    localStorage.setItem(CONTACT_KEY, JSON.stringify({ name, phone, email }));
  } catch {
    // localStorage unavailable (private browsing, quota) — silently skip persistence
  }
}

export function getSavedPhoneCountry() {
  try {
    return localStorage.getItem(PHONE_COUNTRY_KEY);
  } catch {
    return null;
  }
}

export function savePhoneCountry(code) {
  try {
    localStorage.setItem(PHONE_COUNTRY_KEY, code);
  } catch {
    // ignore
  }
}
