import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { X } from 'lucide-react';
import AIInsightsSection from '@/components/common/AIInsightsSection';
import DataResetSection from '@/components/common/DataResetSection';

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

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useFocusTrap({
    active: true,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

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

        <AIInsightsSection
          footprint={footprint}
          loggedActions={loggedActions}
          streakDays={streak.currentDays}
          insights={insights}
          onAddInsight={addInsight}
        />

        <DataResetSection
          onReset={() => {
            resetAll();
            onClose();
          }}
        />
      </motion.div>
    </div>
  );
}
