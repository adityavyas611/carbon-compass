import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import { generateInsight, canMakeAiRequest } from '@/utils/aiInsights';
import { Sparkles, X, RefreshCw } from 'lucide-react';
import InsightCard from './InsightCard';
import { ALL_ACTIONS } from '@/utils/actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISettingsPanel({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && <PanelContent onClose={onClose} />}
    </AnimatePresence>
  );
}

function PanelContent({ onClose }: { onClose: () => void }) {
  const { footprint, loggedActions, streak, addInsight, insights, resetAll } = useCarbonStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleGenerateInsight = async () => {
    if (!footprint || loading) return;
    if (!canMakeAiRequest()) {
      setError('Please wait a few seconds before generating another insight.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const recentActionNames = loggedActions
        .slice(-5)
        .map((a) => ALL_ACTIONS.find((ac) => ac.id === a.actionId)?.title ?? a.actionId);
      const insight = await generateInsight(footprint, recentActionNames, streak.currentDays);
      addInsight(insight);
    } catch (e: unknown) {
      if (import.meta.env.DEV) console.error(e);
      setError('Unable to generate insight. AI may not be configured on this server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={(e) => e.target === backdropRef.current && onClose()}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-forest-900 rounded-t-3xl w-full max-w-lg px-4 pt-4 pb-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="settings-dialog-title" className="text-lg font-bold text-forest-900 dark:text-cream">
            Settings &amp; AI
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close settings"
            className="w-8 h-8 rounded-full bg-sage-100 dark:bg-forest-800 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-forest-400"
          >
            <X className="w-4 h-4 text-sage-600 dark:text-sage-300" aria-hidden="true" />
          </button>
        </div>

        <section aria-labelledby="insights-heading" className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-earth-500" aria-hidden="true" />
              <h3 id="insights-heading" className="text-sm font-semibold text-forest-800 dark:text-cream">
                AI Insights
              </h3>
            </div>
            <button
              onClick={handleGenerateInsight}
              disabled={!footprint || loading}
              aria-label={loading ? 'Generating insight…' : 'Generate new insight'}
              aria-busy={loading}
              className="flex items-center gap-1.5 text-xs font-medium text-forest-600 dark:text-forest-300 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-forest-400 rounded"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`}
                aria-hidden="true"
              />
              Generate
            </button>
          </div>

          <p className="text-xs text-sage-500 dark:text-sage-400 mb-3">
            AI insights are powered by a server-side API. Your data is never sent with an API key from the browser.
          </p>

          <div aria-live="polite" aria-atomic="true">
            {error && (
              <p role="alert" className="text-xs text-red-600 mb-2">
                {error}
              </p>
            )}
            {loading && <InsightCard insight="" loading />}
            {insights.length > 0 && !loading && (
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            )}
            {insights.length === 0 && !loading && !error && (
              <p className="text-xs text-sage-500 italic">Tap Generate to get your first AI coaching tip.</p>
            )}
          </div>
        </section>

        <section aria-labelledby="data-heading" className="border-t border-sage-100 dark:border-forest-700 pt-4">
          <h3 id="data-heading" className="text-sm font-semibold text-sage-700 dark:text-sage-300 mb-2">
            Data
          </h3>
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-sm text-red-500 hover:text-red-600 font-medium focus-visible:ring-2 focus-visible:ring-red-400 rounded"
            >
              Reset all data
            </button>
          ) : (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 mb-3">
                This will erase all your data and start fresh. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    resetAll();
                    onClose();
                  }}
                  className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setShowReset(false)}
                  className="btn-outline text-sm py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
