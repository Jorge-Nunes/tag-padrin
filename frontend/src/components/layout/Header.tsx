import { Moon, Sun, User, Bell, Menu } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useLayoutStore } from '../../store/layoutStore';

export function Header() {
    const { theme, toggleTheme } = useThemeStore();
    const user = useAuthStore((state) => state.user);
    const { setMobileMenuOpen } = useLayoutStore();

    return (
        <header className="h-20 border-b border-gray-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all duration-300">
            {/* Botão Menu Mobile */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden min-w-[44px] min-h-[44px] p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all mr-2"
                aria-label="Abrir menu"
            >
                <Menu size={24} aria-hidden="true" />
            </button>

            <div className="flex-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                    <span className="h-1 w-1 rounded-full bg-blue-500" aria-hidden="true" />
                    <span className="hidden sm:inline">TAG Operations Center</span>
                    <span className="sm:hidden">TAG OPS</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <button 
                        className="min-w-[44px] min-h-[44px] p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                        aria-label="Notificações (1 não lida)"
                    >
                        <Bell size={20} aria-hidden="true" />
                        <span 
                            className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                        aria-label={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
                        title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
                    >
                        {theme === 'light' ? (
                            <Moon size={20} aria-hidden="true" />
                        ) : (
                            <Sun size={20} className="text-amber-400" aria-hidden="true" />
                        )}
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-100 dark:bg-slate-800" />

                <div className="flex items-center space-x-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none capitalize">
                            {user?.name || 'Administrador'}
                        </p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">
                            {user?.role || 'Master'}
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <User size={20} className="text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
}
