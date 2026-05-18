'use client';

import { useTranslation } from '@/lib/i18n';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const { t } = useTranslation();
  const progress = Math.round((current / total) * 100);

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">
          {t('quiz.analyzing')}
        </span>
        <span className="text-sm font-bold text-slate-800">
          {current} / {total}
        </span>
      </div>

      <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute inset-y-0 w-4 bg-white/40 blur-sm transition-all duration-500 ease-out"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>{t('quiz.start')}</span>
        <span className="font-medium text-amber-600">{progress}{t('quiz.percentComplete')}</span>
        <span>{t('quiz.done')}</span>
      </div>
    </div>
  );
}
