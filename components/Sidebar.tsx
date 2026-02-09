import React from 'react';
import { ViewState } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Scroll,
  PenLine,
  Flower,
  Settings,
  Cross,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, toggleSidebar }) => {

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Início', icon: LayoutDashboard },
    { id: ViewState.ROSARY, label: 'Rezar o Terço', icon: Cross },
    { id: ViewState.LITURGY, label: 'Liturgia Diária', icon: BookOpen },
    { id: ViewState.JOURNAL, label: 'Diário Espiritual', icon: PenLine },
    { id: ViewState.NOVENAS, label: 'Novenas', icon: Flower },
    { id: ViewState.SETTINGS, label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white dark:bg-stone-900 border-r border-gold-200 dark:border-gold-800 z-50 transition-transform duration-300 ease-in-out w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] flex items-center justify-between border-b border-gold-100 dark:border-gold-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center text-white">
                <Cross size={18} />
              </div>
              <span className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100 tracking-wide">Abraço do Pai</span>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-stone-500 dark:text-stone-400">
              <X size={24} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeView(item.id);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? 'bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400 font-semibold shadow-sm border border-gold-200 dark:border-gold-800'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'}
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-gold-600 dark:text-gold-500' : 'text-stone-400 group-hover:text-gold-500'} />
                  <span className="font-sans text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gold-100 dark:border-gold-900">
            <div className="bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg p-4 text-white text-center shadow-lg shadow-gold-200/20 dark:shadow-none">
              <p className="font-serif text-sm italic">"Eu sou a luz do mundo."</p>
              <p className="text-xs mt-1 opacity-80">João 8:12</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;