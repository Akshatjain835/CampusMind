import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser({ ...userData, token });
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      localStorage.setItem('token', data.token);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const seedDemoData = async () => {
    try {
      const res = await fetch('/api/auth/seed', { method: 'POST' });
      return await res.json();
    } catch (err) {
      console.error('Failed to seed demo accounts:', err);
    }
  };

  const updateUserProfile = async (updatedFields) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(prev => ({ ...prev, ...data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, updateUserProfile, seedDemoData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
