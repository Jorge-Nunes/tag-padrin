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
        // Adiciona transição suave ao trocar tema
        const root = document.documentElement;
        
        // Desabilita transições temporariamente se for primeira vez
        const isFirstLoad = !root.style.getPropertyValue('--theme-transition');
        
        if (!isFirstLoad) {
            root.style.setProperty('--theme-transition', 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease');
        }
        
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        // Marca que não é mais primeira carga
        if (isFirstLoad) {
            setTimeout(() => {
                root.style.setProperty('--theme-transition', 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease');
            }, 100);
        }
    }
}
