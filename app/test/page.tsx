'use client';

import { Compass } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import QuizContainer from '@/components/quiz/QuizContainer';
import { useTranslation } from '@/lib/i18n';

export default function TestPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white mb-6">
              <Compass className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {t('quiz.pageTitle')}
            </h1>
            <p className="text-lg text-slate-600">
              {t('quiz.pageDesc1')}
              <br className="hidden sm:block" />
              {t('quiz.pageDesc2')}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
              <QuizContainer />
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-12 text-center">
            <p className="text-sm text-slate-500">
              {t('quiz.tip')}
              <br />
              {t('quiz.tip2')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
