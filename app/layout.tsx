import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import SiteTitle from '@/components/SiteTitle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '퍼스널투어 - MBTI 기반 문화유산 여행 추천',
  description: '나의 성향에 맞는 전국 문화유산 여행지를 추천받아보세요. MBTI 테스트로 나만의 문화유산 탐방 코스를 발견하세요.',
  keywords: 'MBTI, 문화유산, 여행, 전국여행, 역사, 문화재, 여행추천',
  openGraph: {
    title: '퍼스널투어 - MBTI 기반 문화유산 여행 추천',
    description: '나의 성향에 맞는 전국 문화유산 여행지를 추천받아보세요.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <LanguageProvider>
          <SiteTitle />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
