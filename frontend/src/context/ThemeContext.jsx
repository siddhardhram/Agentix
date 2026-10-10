import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: (theme) => {},
  isSystem: false,
});

export const THEME_STORAGE_KEY = 'agentix_ui_theme';

function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}

function applyThemeToDom(targetTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', targetTheme);
  root.classList.remove('theme-dark', 'theme-light', 'dark', 'light');
  root.classList.add(`theme-${targetTheme}`, targetTheme);
  root.style.colorScheme = targetTheme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.warn('Failed to read theme preference from storage', e);
    }
    return getSystemTheme();
  });

  const [hasExplicitChoice, setHasExplicitChoice] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'light' || saved === 'dark';
    } catch (e) {
      return false;
    }
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyThemeToDom(theme);

    if (hasExplicitChoice) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (e) {
        console.warn('Failed to save theme preference', e);
      }
    }
  }, [theme, hasExplicitChoice]);

  // Listen to system theme preference changes if user hasn't chosen explicitly
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (!saved) {
          const newSysTheme = e.matches ? 'light' : 'dark';
          applyThemeToDom(newSysTheme);
          setThemeState(newSysTheme);
        }
      } catch (err) {}
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const changeTheme = useCallback((newTheme) => {
    const runTransition = () => {
      applyThemeToDom(newTheme);
      setThemeState(newTheme);
    };

    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(runTransition);
    } else {
      runTransition();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setHasExplicitChoice(true);
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    changeTheme(nextTheme);
  }, [theme, changeTheme]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setHasExplicitChoice(true);
      changeTheme(newTheme);
    } else if (newTheme === 'system') {
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch (e) {}
      setHasExplicitChoice(false);
      changeTheme(getSystemTheme());
    }
  }, [changeTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isSystem: !hasExplicitChoice }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
