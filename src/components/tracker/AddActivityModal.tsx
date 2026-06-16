import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ActivityType } from '@/types';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  ACTIVITY_TYPES,
  ACTIVITY_PRESETS,
  TYPE_META,
  type ActivityPreset,
} from '@/components/tracker/activityPresets';

interface AddActivityModalProps {
  open: boolean;
  selectedType: ActivityType;
  selectedPreset: ActivityPreset | null;
  customNote: string;
  onClose: () => void;
  onTypeChange: (type: ActivityType) => void;
  onPresetChange: (preset: ActivityPreset | null) => void;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
}

export default function AddActivityModal({
  open,
  selectedType,
  selectedPreset,
  customNote,
  onClose,
  onTypeChange,
  onPresetChange,
  onNoteChange,
  onSubmit,
}: AddActivityModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    active: open,
    containerRef: modalRef,
    initialFocusRef: closeRef,
    onEscape: onClose,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          aria-hidden="true"
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-activity-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-forest-900 rounded-t-3xl w-full max-w-lg px-4 pt-4 pb-10 max-h-[85vh] overflow-y-auto"
            aria-hidden="false"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="add-activity-title" className="text-lg font-bold text-forest-900 dark:text-cream">
                Log an Activity
              </h3>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close activity log"
                className="w-8 h-8 rounded-full bg-sage-100 dark:bg-forest-800 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-sage-600" aria-hidden="true" />
              </button>
            </div>

            <fieldset className="mb-4">
              <legend className="text-xs font-semibold text-forest-700 dark:text-cream mb-2">Category</legend>
              <div className="grid grid-cols-4 gap-2">
                {ACTIVITY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onTypeChange(t);
                      onPresetChange(null);
                    }}
                    aria-pressed={selectedType === t}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                      selectedType === t
                        ? 'border-forest-500 bg-forest-50'
                        : 'border-sage-200 hover:border-sage-300'
                    }`}
                  >
                    <span className="text-xl" aria-hidden="true">{TYPE_META[t].emoji}</span>
                    <span className="text-xs font-medium text-forest-800">{TYPE_META[t].label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2 mb-4">
              <legend className="text-xs font-semibold text-forest-700 mb-2">Quick select</legend>
              {ACTIVITY_PRESETS[selectedType].map((p) => (
                <button
                  key={p.label}
                  onClick={() => onPresetChange(p)}
                  aria-pressed={selectedPreset?.label === p.label}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    selectedPreset?.label === p.label
                      ? 'border-forest-500 bg-forest-50'
                      : 'border-sage-200 hover:border-sage-300'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm text-forest-900">
                    <span aria-hidden="true">{p.emoji}</span> {p.label}
                  </span>
                  <span
                    className={`text-xs font-semibold ${p.co2Kg <= 0 ? 'text-forest-600' : 'text-earth-600'}`}
                    aria-label={`${p.co2Kg <= 0 ? 'saves' : 'emits'} ${Math.abs(p.co2Kg).toFixed(1)} kg CO₂`}
                  >
                    {p.co2Kg <= 0 ? `−${Math.abs(p.co2Kg).toFixed(1)} kg` : `+${p.co2Kg.toFixed(1)} kg`}
                  </span>
                </button>
              ))}
            </fieldset>

            <label htmlFor="activity-note" className="sr-only">
              Optional note
            </label>
            <input
              id="activity-note"
              type="text"
              placeholder="Optional note…"
              value={customNote}
              onChange={(e) => onNoteChange(e.target.value)}
              maxLength={500}
              className="input-base mb-4"
            />

            <button
              onClick={onSubmit}
              disabled={!selectedPreset}
              aria-disabled={!selectedPreset}
              className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Activity
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
