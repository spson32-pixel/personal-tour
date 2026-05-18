'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MBTIQuestion, MBTIScores, UserResponse } from '@/lib/types';
import rawData from '@/lib/data/questions.json';
import { calculateMBTIScores, determineMBTI } from '@/lib/recommendation';
import { storage } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';

type RawQuestion = { id: number; dimension: string; options: Array<{ scores: Partial<MBTIScores> }> };
const rawQuestions: RawQuestion[] = rawData as RawQuestion[];

export default function QuizContainer() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const totalQuestions = rawQuestions.length;

  const buildQuestion = (index: number): MBTIQuestion => {
    const raw = rawQuestions[index];
    return {
      id: raw.id,
      dimension: raw.dimension,
      question: t(`quiz.q${raw.id}`),
      options: raw.options.map((opt, i) => ({
        scores: opt.scores,
        text: t(`quiz.q${raw.id}_${i === 0 ? 'a' : 'b'}`),
      })),
    };
  };

  const currentQuestion = buildQuestion(currentQuestionIndex);

  const handlePrevious = () => {
    if (currentQuestionIndex === 0 || isAnimating) return;
    setDirection('backward');
    setIsAnimating(true);
    const prevResponse = responses.find(
      (r) => r.questionId === rawQuestions[currentQuestionIndex - 1].id
    );
    setTimeout(() => {
      setSelectedOption(prevResponse?.selectedOption ?? null);
      setCurrentQuestionIndex((prev) => prev - 1);
      setIsAnimating(false);
    }, 200);
  };


  const completeTest = (finalResponses: UserResponse[]) => {
    setIsCompleting(true);
    const scoreResponses = finalResponses.map((response) => {
      const raw = rawQuestions.find((q) => q.id === response.questionId);
      const option = raw?.options[response.selectedOption];
      return { questionId: response.questionId, scores: option?.scores || {} };
    });

    const scores = calculateMBTIScores(scoreResponses);
    const mbti = determineMBTI(scores);
    storage.set('mbti_result', { mbti, scores, responses: finalResponses });
    router.push('/result');
  };

  const handleSelect = (optionIndex: number) => {
    if (isAnimating || isCompleting) return;
    setSelectedOption(optionIndex);
    setDirection('forward');

    const newResponse: UserResponse = {
      questionId: currentQuestion.id,
      selectedOption: optionIndex,
    };
    const updatedResponses = [
      ...responses.filter((r) => r.questionId !== currentQuestion.id),
      newResponse,
    ];
    setResponses(updatedResponses);

    setTimeout(() => {
      setIsAnimating(true);
      if (currentQuestionIndex < totalQuestions - 1) {
        const nextResponse = updatedResponses.find(
          (r) => r.questionId === rawQuestions[currentQuestionIndex + 1].id
        );
        setTimeout(() => {
          setSelectedOption(nextResponse?.selectedOption ?? null);
          setCurrentQuestionIndex((prev) => prev + 1);
          setIsAnimating(false);
        }, 200);
      } else {
        setTimeout(() => {
          setIsAnimating(false);
          completeTest(updatedResponses);
        }, 200);
      }
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
      </div>

      <div
        className={`transition-all duration-200 ${
          isAnimating
            ? direction === 'forward'
              ? 'opacity-0 translate-x-4'
              : 'opacity-0 -translate-x-4'
            : 'opacity-100 translate-x-0'
        }`}
      >
        <QuestionCard
          question={currentQuestion}
          selectedOption={selectedOption}
          onSelect={handleSelect}
        />
      </div>

      <div className="mt-8 flex justify-start items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isAnimating || isCompleting}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('quiz.prev')}
        </Button>
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {rawQuestions.map((_, index) => (
          <div
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index === currentQuestionIndex
                ? 'w-6 h-2 bg-slate-900'
                : index < currentQuestionIndex
                ? 'w-2 h-2 bg-slate-400'
                : 'w-2 h-2 bg-slate-200'
            }`}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        {t('quiz.questionOf', {
          current: String(currentQuestionIndex + 1),
          total: String(totalQuestions),
        })}
        {selectedOption !== null && ` · ${t('quiz.selected')}`}
      </p>
    </div>
  );
}
