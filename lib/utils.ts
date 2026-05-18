import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind 클래스 병합 유틸리티
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 숫자 포맷팅 (천 단위 콤마)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 점수에 따른 색상 클래스 반환
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return 'text-emerald-600 bg-emerald-50';
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 70) return 'text-blue-600 bg-blue-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-gray-600 bg-gray-50';
}

/**
 * MBTI 타입별 색상 테마
 */
export function getMBTIColorTheme(mbti: string): {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
} {
  const type = mbti.toLowerCase();
  
  // 분석가형 (NT)
  if (['intj', 'intp', 'entj', 'entp'].includes(type)) {
    return {
      primary: 'text-purple-700',
      secondary: 'bg-purple-50',
      accent: 'border-purple-200',
      gradient: 'from-purple-600 to-indigo-600'
    };
  }
  
  // 외교관형 (NF)
  if (['infj', 'infp', 'enfj', 'enfp'].includes(type)) {
    return {
      primary: 'text-emerald-700',
      secondary: 'bg-emerald-50',
      accent: 'border-emerald-200',
      gradient: 'from-emerald-600 to-teal-600'
    };
  }
  
  // 관리자형 (SJ)
  if (['istj', 'isfj', 'estj', 'esfj'].includes(type)) {
    return {
      primary: 'text-blue-700',
      secondary: 'bg-blue-50',
      accent: 'border-blue-200',
      gradient: 'from-blue-600 to-cyan-600'
    };
  }
  
  // 탐험가형 (SP)
  return {
    primary: 'text-orange-700',
    secondary: 'bg-orange-50',
    accent: 'border-orange-200',
    gradient: 'from-orange-500 to-amber-500'
  };
}

/**
 * 지역 이름 매핑
 */
export function getRegionName(region: string): string {
  const regionMap: Record<string, string> = {
    'all': '전국',
    'seoul': '서울',
    'gyeonggi': '경기·인천',
    'gangwon': '강원',
    'chungcheong': '충청·대전',
    'jeolla': '전라·광주',
    'gyeongsang': '경상·부산·대구',
    'jeju': '제주'
  };
  return regionMap[region] || region;
}

/**
 * 텍스트 길이 제한
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 로컬스토리지 유틸리티
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
};

/**
 * 스크롤 맨 위로
 */
export function scrollToTop(smooth: boolean = true): void {
  if (typeof window === 'undefined') return;
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}
