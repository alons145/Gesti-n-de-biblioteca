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
    container: 'bg-green-50 border-green-500 text-green-800',
    title: 'text-green-900',
  },
  error: {
    container: 'bg-red-50 border-red-500 text-red-700',
    title: 'text-red-900',
  },
  info: {
    container: 'bg-blue-50 border-blue-500 text-blue-800',
    title: 'text-blue-900',
  },
};

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ type, title, message, onClose }) => {
  const variant = styles[type];

  return (
    <div className={`mb-6 p-4 border-l-4 rounded-lg flex items-start justify-between gap-4 ${variant.container}`}>
      <div>
        {title && <p className={`font-semibold text-sm mb-1 ${variant.title}`}>{title}</p>}
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 mt-0.5">
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
