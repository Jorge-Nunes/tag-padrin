import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';
                    updateDOM(newTheme);
                    return { theme: newTheme };
                }),
            setTheme: (theme) => {
                updateDOM(theme);
                set({ theme });
            },
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    updateDOM(state.theme);
                }
            },
        }
    )
);

function updateDOM(theme: 'light' | 'dark') {
    if (typeof document !== 'undefined') {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}
