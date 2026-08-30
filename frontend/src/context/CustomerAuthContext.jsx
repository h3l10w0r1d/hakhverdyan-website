import { createContext, useContext, useEffect, useState } from "react";
import {
  customerLogin, customerMe, customerRegister, customerUpdateMe,
  getCustomerToken, setCustomerToken,
} from "../lib/customerApi";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      setLoading(false);
      return;
    }
    customerMe()
      .then(setCustomer)
      .catch(() => setCustomerToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const result = await customerLogin(email, password);
    setCustomerToken(result.access_token);
    setCustomer(result.customer);
    return result;
  }

  async function register(payload) {
    const result = await customerRegister(payload);
    setCustomerToken(result.access_token);
    setCustomer(result.customer);
    return result;
  }

  async function updateProfile(payload) {
    const result = await customerUpdateMe(payload);
    setCustomer(result);
    return result;
  }

  function logout() {
    setCustomerToken(null);
    setCustomer(null);
  }

  const value = { customer, loading, login, register, updateProfile, logout, isAuthenticated: !!customer };
  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
