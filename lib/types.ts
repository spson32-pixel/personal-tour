/**
 * MBTI 타입 정의
 */
export type MBTIType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ'
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP'
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

export type MBTIDimension = 'E' | 'I' | 'N' | 'S' | 'T' | 'F' | 'J' | 'P';

/**
 * MBTI 점수 구조
 */
export interface MBTIScores {
  E: number;  // 외향
  I: number;  // 내향
  N: number;  // 직관
  S: number;  // 감각
  T: number;  // 사고
  F: number;  // 감정
  J: number;  // 판단
  P: number;  // 인식
}

/**
 * 질문 옵션
 */
export interface QuestionOption {
  text: string;
  scores: Partial<MBTIScores>;
}

/**
 * MBTI 질문
 */
export interface MBTIQuestion {
  id: number;
  question: string;
  dimension: string; // 예: "E/I", "N/S", "T/F", "J/P"
  options: QuestionOption[];
}

/**
 * 지역 타입
 */
export type Region = 
  | 'all' 
  | 'seoul' 
  | 'gyeonggi' 
  | 'gangwon' 
  | 'chungcheong' 
  | 'jeolla' 
  | 'gyeongsang' 
  | 'jeju';

/**
 * 문화유산 데이터 구조
 */
export interface Heritage {
  id: string;
  name: string;
  region: Region;
  city: string;
  summary: string;
  historicalDescription: string;
  emotionalDescription: string;
  tags: string[];
  
  // MBTI 매칭 점수 (0-100)
  popularityScore: number;      // E: 붐비는 곳
  quietScore: number;           // I: 조용한 곳
  imaginationScore: number;     // N: 상상력 자극
  historyScore: number;         // S: 역사적 사실
  analysisScore: number;        // T: 분석/논리
  emotionalScore: number;       // F: 감성/분위기
  structuredCourseScore: number; // J: 계획된 동선
  freeExploreScore: number;     // P: 자유 탐방
  natureScore: number;          // P: 자연과 어우러짐
  
  bestTime: string;
  nearbySites: string[];
  image: string;
  featured: boolean;
  website?: string;
}

/**
 * 사용자 응답
 */
export interface UserResponse {
  questionId: number;
  selectedOption: number;
}

/**
 * 테스트 결과
 */
export interface TestResult {
  mbti: MBTIType;
  scores: MBTIScores;
  responses: UserResponse[];
}

/**
 * 추천 문화유산 (점수 포함)
 */
export interface RecommendedHeritage extends Heritage {
  matchScore: number;
  matchReasons: string[];
}

/**
 * OpenAI 생성 페르소나
 */
export interface GeneratedPersona {
  personaTitle: string;
  personaSummary: string;
  explorationStyle: string;
  recommendationTone: string;
}

/**
 * 결과 페이지 데이터
 */
export interface ResultData {
  mbti: MBTIType;
  scores: MBTIScores;
  persona: GeneratedPersona;
  recommendations: RecommendedHeritage[];
  course: {
    title: string;
    description: string;
    sites: string[];
  };
}

/**
 * 지역 매핑 정보
 */
export const REGION_MAP: Record<Region, { name: string; subRegions: string[] }> = {
  all: { name: '전국', subRegions: [] },
  seoul: { name: '서울', subRegions: ['서울'] },
  gyeonggi: { name: '경기', subRegions: ['경기', '수원', '안양', '고양', '용인'] },
  gangwon: { name: '강원', subRegions: ['강원', '강릉', '속초', '춘천'] },
  chungcheong: { name: '충청', subRegions: ['충청', '대전', '청주', '공주', '부여', '논산'] },
  jeolla: { name: '전라', subRegions: ['전라', '전주', '광주', '순천', '여수', '익산', '남원'] },
  gyeongsang: { name: '경상', subRegions: ['경상', '부산', '대구', '경주', '안동', '울산', '통영'] },
  jeju: { name: '제주', subRegions: ['제주'] },
};

/**
 * MBTI별 브랜딩 타이틀
 */
export const MBTI_BRAND_TITLES: Record<MBTIType, string> = {
  ISTJ: '철저한 여행지 탐방가',
  ISFJ: '섬세한 문화 수호자',
  INFJ: '깊은 통찰의 여행지 탐색가',
  INTJ: '전략적 문화 분석가',
  ISTP: '실용적인 여행지 체험가',
  ISFP: '감성적인 여행지 감상가',
  INFP: '몽환적인 여행지 상상가',
  INTP: '논리적인 여행지 탐구자',
  ESTP: '활동적인 문화 모험가',
  ESFP: '열정적인 여행지 즐기미',
  ENFP: '자유로운 문화 발견가',
  ENTP: '창의적인 여행지 해석가',
  ESTJ: '효율적인 문화 탐방가',
  ESFJ: '따뜻한 문화 공유자',
  ENFJ: '영감을 주는 여행지 스토리텔러',
  ENTJ: '비전을 가진 문화 리더',
};

/**
 * MBTI별 한 줄 설명
 */
export const MBTI_SHORT_DESCRIPTIONS: Record<MBTIType, string> = {
  ISTJ: '체계적으로 역사적 사실을 파헤치며, 검증된 정보를 중시하는 탐방가',
  ISFJ: '조용히 여행지의 세밀한 가치를 느끼며 전통을 존중하는 관람객',
  INFJ: '여행지에 담긴 깊은 의미와 인간 이야기를 찾는 성찰형 탐방가',
  INTJ: '여행지의 전략적 가치와 장기적 의미를 분석하는 체계적 탐구자',
  ISTP: '직접 체험하며 여행지의 실용적 기능과 구조를 파악하는 탐험가',
  ISFP: '여행지의 미적 감각과 순간의 분위기를 섬세하게 느끼는 예술가',
  INFP: '여행지에 담긴 감성과 상상력을 통해 새로운 해석을 창조하는 몽상가',
  INTP: '여행지의 원리와 역사적 맥락을 논리적으로 분석하는 학자형 탐구자',
  ESTP: '발 빠르게 다양한 여행지를 직접 경험하며 즐기는 활동파 탐방가',
  ESFP: '여행지의 생동감 있는 부분을 즐기며 주변과 공유하는 사교형 관람객',
  ENFP: '새로운 여행지를 발견하고 다양한 가능성을 탐색하는 자유로운 여행자',
  ENTP: '여행지에 대한 새로운 관점과 창의적 해석을 제시하는 혁신가',
  ESTJ: '효율적으로 계획된 동선으로 여행지를 체계적으로 탐방하는 실천가',
  ESFJ: '여행지를 통해 타인과 연결되고 공동체적 가치를 나누는 공유자',
  ENFJ: '여행지의 이야기를 통해 타인에게 영감을 주는 카리스마 스토리텔러',
  ENTJ: '여행지의 비전과 가치를 전략적으로 경험하는 리더형 탐방가',
};
