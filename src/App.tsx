import { lazy, Suspense } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import AssessmentFlow from '@/components/onboarding/AssessmentFlow';
import Navigation from '@/components/common/Navigation';
import ThemeToggle from '@/components/common/ThemeToggle';

const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const ActionHub = lazy(() => import('@/components/actions/ActionHub'));
const HabitTracker = lazy(() => import('@/components/tracker/HabitTracker'));
const ProgressPage = lazy(() => import('@/components/progress/ProgressPage'));

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const PAGE_VARIANTS_REDUCED = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  actions: 'Action Hub',
  tracker: 'Daily Tracker',
  progress: 'Progress',
};

function ViewFallback() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Loading page">
      <div className="w-8 h-8 border-2 border-forest-400 border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
    </div>
  );
}

export default function App() {
  const { hasCompletedOnboarding, currentView } = useCarbonStore();
  const prefersReduced = useReducedMotion();
  const variants = prefersReduced ? PAGE_VARIANTS_REDUCED : PAGE_VARIANTS;

  if (!hasCompletedOnboarding) {
    return <AssessmentFlow />;
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-forest-950 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-forest-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 bg-cream/90 dark:bg-forest-950/90 backdrop-blur-sm border-b border-sage-200 dark:border-forest-700">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <div className="w-7 h-7 bg-forest-600 rounded-lg flex items-center justify-center" aria-hidden="true">
            <span className="text-white text-xs font-bold">🌱</span>
          </div>
          <span className="font-bold text-forest-900 dark:text-cream text-sm">CarbonTrack</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs text-muted font-medium" aria-live="polite">
              {VIEW_LABELS[currentView]}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <Suspense fallback={<ViewFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: prefersReduced ? 0 : 0.2, ease: 'easeOut' }}
            >
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'actions' && <ActionHub />}
              {currentView === 'tracker' && <HabitTracker />}
              {currentView === 'progress' && <ProgressPage />}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <footer className="pb-20 text-center text-xs text-muted px-4">
        CarbonTrack — measure, understand, reduce.
      </footer>

      <Navigation />
    </div>
  );
}
