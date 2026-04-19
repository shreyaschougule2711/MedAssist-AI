import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('medassist_token');
    const saved = localStorage.getItem('medassist_doctor');
    if (token && saved) {
      setDoctor(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (medicalId, password) => {
    const res = await api.post('/auth/login', { medical_id: medicalId, password });
    const { access_token, doctor: doc } = res.data;
    localStorage.setItem('medassist_token', access_token);
    localStorage.setItem('medassist_doctor', JSON.stringify(doc));
    setDoctor(doc);
    return doc;
  };

  const register = async (medicalId, name, specialty, password) => {
    await api.post('/auth/register', {
      medical_id: medicalId, name, specialty, password
    });
  };

  const logout = () => {
    localStorage.removeItem('medassist_token');
    localStorage.removeItem('medassist_doctor');
    setDoctor(null);
  };

  return (
    <AuthContext.Provider value={{ doctor, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);