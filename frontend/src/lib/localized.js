// Backend records carry English fields plus "_<lang>" counterparts
// (e.g. name / name_hy / name_ru). Pick the right one for the given
// language, falling back to English if a translation is missing.
export function localized(obj, field, lang) {
  if (!obj) return "";
  if (lang && lang !== "en" && obj[`${field}_${lang}`]) return obj[`${field}_${lang}`];
  return obj[field] ?? "";
}
