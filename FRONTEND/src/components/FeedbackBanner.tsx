import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackBannerProps {
  type: FeedbackType;
  title?: string;
  message: string;
  onClose?: () => void;
}

const styles: Record<FeedbackType, { container: string; title: string }> = {
  success: {
    container: 'border-emerald-200 bg-emerald-50/90 text-emerald-800',
    title: 'text-emerald-950',
  },
  error: {
    container: 'border-rose-200 bg-rose-50/90 text-rose-800',
    title: 'text-rose-950',
  },
  info: {
    container: 'border-sky-200 bg-sky-50/90 text-sky-800',
    title: 'text-sky-950',
  },
};

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ type, title, message, onClose }) => {
  const variant = styles[type];

  return (
    <div className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur ${variant.container}`}>
      <div>
        {title && <p className={`mb-1 text-sm font-semibold ${variant.title}`}>{title}</p>}
        <p className="text-sm font-medium leading-6">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 rounded-full p-1 transition hover:bg-white/50">
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
