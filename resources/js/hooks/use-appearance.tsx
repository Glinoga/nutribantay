import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

export const applyTheme = (appearance: Appearance) => {
    if (document.documentElement.dataset.printMode) return;

    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
};

const getSystemThemeListener = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.matchMedia('(prefers-color-scheme: dark)');
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
    applyTheme(savedAppearance);
}

interface ThemeContextValue {
    appearance: Appearance;
    isDark: boolean;
    updateAppearance: (mode: Appearance) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [appearance, setAppearance] = useState<Appearance>('system');
    const [isDark, setIsDark] = useState(false);

    const syncDarkState = useCallback((mode: Appearance) => {
        const dark = mode === 'dark' || (mode === 'system' && prefersDark());
        setIsDark(dark);
    }, []);

    const updateAppearance = useCallback(
        (mode: Appearance) => {
            setAppearance(mode);
            localStorage.setItem('appearance', mode);
            setCookie('appearance', mode);
            applyTheme(mode);
            syncDarkState(mode);
        },
        [syncDarkState],
    );

    useEffect(() => {
        const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
        updateAppearance(savedAppearance);
    }, [updateAppearance]);

    useEffect(() => {
        const mq = getSystemThemeListener();
        if (!mq) return;

        const handler = () => {
            const current = (localStorage.getItem('appearance') as Appearance) || 'system';
            applyTheme(current);
            syncDarkState(current);
        };

        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [syncDarkState]);

    const value = useMemo<ThemeContextValue>(() => ({ appearance, isDark, updateAppearance }), [appearance, isDark, updateAppearance]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppearance(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppearance must be used within a ThemeProvider');
    }
    return context;
}
