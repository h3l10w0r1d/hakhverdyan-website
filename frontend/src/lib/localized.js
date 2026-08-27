// Backend records carry English fields plus "_hy" Armenian counterparts
// (e.g. name / name_hy). Pick the right one for the current language,
// falling back to English if a translation is missing.
export function localized(obj, field, lang) {
  if (!obj) return "";
  if (lang === "hy" && obj[`${field}_hy`]) return obj[`${field}_hy`];
  return obj[field] ?? "";
}
