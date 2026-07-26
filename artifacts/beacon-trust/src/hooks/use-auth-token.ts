import { useState, useEffect } from 'react';

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('beacon_token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('beacon_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('beacon_token', newToken);
    } else {
      localStorage.removeItem('beacon_token');
    }
    setToken(newToken);
    window.dispatchEvent(new Event('storage'));
  };

  return { token, saveToken };
}
