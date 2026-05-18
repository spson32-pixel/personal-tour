'use client';

import { useTranslation } from '@/lib/i18n';
import { MBTIQuestion, QuestionOption } from '@/lib/types';

const DIMENSION_STYLE: Record<string, {
  leftEmoji: string;
  rightEmoji: string;
  color: string;
  bgColor: string;
}> = {
  'E/I': {
    leftEmoji: '🌟',
    rightEmoji: '🌙',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-100',
  },
  'N/S': {
    leftEmoji: '💡',
    rightEmoji: '🔍',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-100',
  },
  'T/F': {
    leftEmoji: '🧠',
    rightEmoji: '❤️',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-100',
  },
  'J/P': {
    leftEmoji: '📋',
    rightEmoji: '🌊',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-100',
  },
};

const DIMENSION_KEY: Record<string, string> = {
  'E/I': 'dimEI',
  'N/S': 'dimNS',
  'T/F': 'dimTF',
  'J/P': 'dimJP',
};

interface QuestionCardProps {
  question: MBTIQuestion;
  selectedOption: number | null;
  onSelect: (optionIndex: number) => void;
}

export default function QuestionCard({
  question,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  const { t } = useTranslation();

  const style = DIMENSION_STYLE[question.dimension] || {
    leftEmoji: 'A',
    rightEmoji: 'B',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-100',
  };
  const dimLabelKey = DIMENSION_KEY[question.dimension];
  const dimLabel = dimLabelKey ? t(`quiz.${dimLabelKey}`) : question.dimension;
  const dimSuffix = t('quiz.dimSuffix');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${style.bgColor} ${style.color}`}>
            {dimLabel}{dimSuffix}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option: QuestionOption, index: number) => {
          const isSelected = selectedOption === index;
          const emoji = index === 0 ? style.leftEmoji : style.rightEmoji;

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`
                quiz-option w-full text-left rounded-2xl border-2 transition-all duration-200 group
                ${isSelected
                  ? 'border-slate-900 bg-slate-900 shadow-lg shadow-slate-900/20 scale-[1.01]'
                  : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-md hover:bg-slate-50'
                }
              `}
            >
              <div className="flex items-start gap-4 p-5 sm:p-6">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg
                  transition-all duration-200
                  ${isSelected ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'}
                `}>
                  {emoji}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${isSelected
                        ? 'border-white bg-white text-slate-900'
                        : 'border-slate-300 text-slate-400'
                      }
                    `}>
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <p className={`text-base sm:text-lg leading-relaxed font-medium ${
                    isSelected ? 'text-white' : 'text-slate-700'
                  }`}>
                    {option.text}
                  </p>
                </div>

                <div className={`
                  flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${isSelected
                    ? 'border-white bg-white'
                    : 'border-slate-200'
                  }
                `}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedOption === null && (
        <p className="text-center text-sm text-slate-400">
          {t('quiz.hint')}
        </p>
      )}
    </div>
  );
}
