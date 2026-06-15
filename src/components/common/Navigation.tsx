import { motion } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import type { AppView } from '@/types';
import { LayoutDashboard, Target, CalendarDays, TrendingUp, Settings } from 'lucide-react';
import { useState } from 'react';
import AISettingsPanel from './AISettingsPanel';

const NAV_ITEMS: { view: AppView; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" aria-hidden="true" /> },
  { view: 'actions', label: 'Actions', icon: <Target className="w-5 h-5" aria-hidden="true" /> },
  { view: 'tracker', label: 'Tracker', icon: <CalendarDays className="w-5 h-5" aria-hidden="true" /> },
  { view: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" aria-hidden="true" /> },
];

export default function Navigation() {
  const { currentView, setView } = useCarbonStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main navigation" className="fixed bottom-0 inset-x-0 bg-white dark:bg-forest-900 border-t border-sage-100 dark:border-forest-800 z-40 pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ view, label, icon }) => (
            <button
              key={view}
              onClick={() => setView(view)}
              aria-current={currentView === view ? 'page' : undefined}
              aria-label={label}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
                currentView === view
                  ? 'text-forest-600 dark:text-forest-300'
                  : 'text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300'
              }`}
            >
              {currentView === view && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-forest-50 dark:bg-forest-800 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10" aria-hidden="true">{icon}</span>
              <span className="relative z-10 text-xs font-medium">{label}</span>
            </button>
          ))}

          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Open AI settings"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 transition-all"
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>

      <AISettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
