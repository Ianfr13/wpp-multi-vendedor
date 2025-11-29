'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CRMThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const CRMThemeContext = createContext<CRMThemeContextType | undefined>(undefined);

export function CRMThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState('indigo');
  const [isDark, setIsDark] = useState(false);

  // Optional: Persist to local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('crm-theme-color');
    const savedMode = localStorage.getItem('crm-is-dark');
    if (savedTheme) setThemeColor(savedTheme);
    if (savedMode) setIsDark(savedMode === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('crm-theme-color', themeColor);
    localStorage.setItem('crm-is-dark', String(isDark));
    
    // Apply to body/html for tailwind if needed, though the user code uses inline logic
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeColor, isDark]);

  return (
    <CRMThemeContext.Provider value={{ themeColor, setThemeColor, isDark, toggleTheme: () => setIsDark(prev => !prev) }}>
      {children}
    </CRMThemeContext.Provider>
  );
}

export function useCRMTheme() {
  const context = useContext(CRMThemeContext);
  if (context === undefined) {
    throw new Error('useCRMTheme must be used within a CRMThemeProvider');
  }
  return context;
}
