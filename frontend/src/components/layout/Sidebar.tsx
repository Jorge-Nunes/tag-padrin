import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, Settings as SettingsIcon, LogOut, Grid, ChevronLeft, ChevronRight, Users as UsersIcon, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLayoutStore } from '../../store/layoutStore';
import { useEffect } from 'react';
import { focus } from '../../design-tokens';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isSidebarCollapsed, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useLayoutStore();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tags', icon: Grid, label: 'Dispositivos' },
    { to: '/settings', icon: SettingsIcon, label: 'Configurações' },
    { to: '/users', icon: UsersIcon, label: 'Usuários', adminOnly: true },
  ].filter(item => !item.adminOnly || user?.role === 'ADMIN');

  // Fecha menu mobile ao clicar em link
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  // Previne scroll do body quando mobile menu está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 
          min-h-screen flex flex-col shadow-sm transition-all duration-300 relative
          ${isSidebarCollapsed ? 'w-20' : 'w-72'}
          
          /* Mobile: drawer que desliza da esquerda */
          fixed md:static inset-y-0 left-0 z-50
          transform md:transform-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
      {/* Botão fechar em mobile */}
      <button
        onClick={() => setMobileMenuOpen(false)}
        className="absolute top-4 right-4 md:hidden min-w-[44px] min-h-[44px] p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
        aria-label="Fechar menu"
      >
        <X size={20} />
      </button>

      {/* Toggle Button - apenas desktop */}
      <button
        onClick={toggleSidebar}
        className="hidden md:block absolute -right-3 top-24 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full p-1.5 shadow-md text-gray-400 hover:text-blue-600 transition-all z-50 group"
        aria-label={isSidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {isSidebarCollapsed ? (
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        ) : (
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
        )}
      </button>

      <div className={`p-8 ${isSidebarCollapsed ? 'px-5' : ''}`}>
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
            <MapPin className="text-white w-6 h-6" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight animate-in fade-in duration-300">Tag Padrin</span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {!isSidebarCollapsed && (
          <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-in fade-in">Principal</p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            title={isSidebarCollapsed ? item.label : ''}
            className={({ isActive }) =>
              `flex items-center rounded-xl font-semibold transition-all duration-200 group ${focus.visible}
              ${isSidebarCollapsed ? 'justify-center min-h-[44px] p-3' : 'space-x-3 px-4 py-3 min-h-[44px]'}
              ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0`} aria-hidden="true" />
            {!isSidebarCollapsed && (
              <span className="text-[15px] animate-in fade-in duration-300">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={`p-6 ${isSidebarCollapsed ? 'p-4' : ''}`}>
        <div className={`rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <button
            onClick={logout}
            title={isSidebarCollapsed ? 'Finalizar Sessão' : ''}
            aria-label="Finalizar sessão"
            className={`flex items-center font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group rounded-xl ${focus.visible}
              ${isSidebarCollapsed ? 'justify-center min-h-[44px] p-3 w-full' : 'space-x-3 px-4 py-3 min-h-[44px] w-full'}
            `}
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform shrink-0" aria-hidden="true" />
            {!isSidebarCollapsed && (
              <span className="text-sm animate-in fade-in duration-300">Finalizar Sessão</span>
            )}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
