import { useState } from "react";
import CountrySelect from "./CountrySelect";
import { COUNTRIES, DEFAULT_COUNTRY_CODE } from "../lib/countries";
import { getSavedPhoneCountry, savePhoneCountry } from "../lib/userPrefs";

function splitPhone(value) {
  if (!value || !value.trim().startsWith("+")) return null;
  const trimmed = value.trim();
  const byLongestDial = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of byLongestDial) {
    if (trimmed.startsWith(c.dial)) {
      return { code: c.code, number: trimmed.slice(c.dial.length).trim() };
    }
  }
  return null;
}

export default function PhoneInput({ id, value, onChange, placeholder }) {
  const [state] = useState(() => {
    const parsed = splitPhone(value);
    return {
      code: parsed?.code || getSavedPhoneCountry() || DEFAULT_COUNTRY_CODE,
      number: parsed?.number || "",
    };
  });
  const [countryCode, setCountryCode] = useState(state.code);
  const [number, setNumber] = useState(state.number);

  function emit(code, num) {
    const dial = COUNTRIES.find(c => c.code === code)?.dial || "";
    onChange(num ? `${dial} ${num}` : "");
  }

  function handleCountryChange(code) {
    setCountryCode(code);
    savePhoneCountry(code);
    emit(code, number);
  }

  function handleNumberChange(e) {
    const num = e.target.value;
    setNumber(num);
    emit(countryCode, num);
  }

  return (
    <div className="phone-field">
      <CountrySelect value={countryCode} onChange={handleCountryChange} />
      <input
        id={id}
        type="tel"
        inputMode="tel"
        value={number}
        onChange={handleNumberChange}
        placeholder={placeholder}
      />
    </div>
  );
}
