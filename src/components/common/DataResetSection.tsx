import { useState } from 'react';

interface Props {
  onReset: () => void;
}

export default function DataResetSection({ onReset }: Props) {
  const [showReset, setShowReset] = useState(false);

  return (
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
                onReset();
                setShowReset(false);
              }}
              className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Yes, reset
            </button>
            <button onClick={() => setShowReset(false)} className="btn-outline text-sm py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
