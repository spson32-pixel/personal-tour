import { Heritage, MBTIType, Region, RecommendedHeritage, MBTIScores } from './types';
import rawHeritageData from './data/heritages.json';

// JSON 데이터를 Heritage 타입으로 단언
const heritageData = rawHeritageData as Heritage[];

// ============================================================
// 1. 고도화된 타입 정의
// ============================================================

export interface ScoreBreakdown {
  total: number;
  components: {
    primary: Array<{ attr: string; rawScore: number; weight: number; weightedScore: number }>;
    secondary: Array<{ attr: string; rawScore: number; weight: number; weightedScore: number }>;
    avoid: Array<{ attr: string; rawScore: number; weight: number; penalty: number }>;
    hardFilters: Array<{ attr: string; passed: boolean; penalty: number; threshold: number }>;
    tags: Array<{ tag: string; type: 'preferred' | 'avoid'; score: number }>;
  };
  axisContribution: {
    EI: number;  // 양수: E, 음수: I
    NS: number;  // 양수: N, 음수: S
    TF: number;  // 양수: T, 음수: F
    JP: number;  // 양수: J, 음수: P
  };
}

export interface MatchExplanation {
  topTags: string[];              // 상위 3개 태그
  keyAttributes: string[];        // 핵심 속성
  mbtiFit: string;               // MBTI 적합도 설명
  axisAlignment: {               // 축별 정렬
    axis: string;
    direction: string;
    strength: number;
  }[];
}

export interface EnhancedRecommendedHeritage extends RecommendedHeritage {
  scoreBreakdown: ScoreBreakdown;
  explanation: MatchExplanation;
  quality: 'excellent' | 'good' | 'acceptable';
}

// ============================================================
// 2. MBTI별 고도화된 프로필
// ============================================================

interface EnhancedMBTIProfile {
  // Primary: 가중치 ×5
  primary: Array<keyof Heritage>;
  // Secondary: 가중치 ×2
  secondary: Array<keyof Heritage>;
  // Avoid: 가중치 ×-4
  avoid: Array<keyof Heritage>;
  // 하드 필터
  hardFilters: {
    attribute: keyof Heritage;
    minScore: number;
    penalty: number;
    description: string;
  }[];
  // 선호/피할 태그
  preferredTags: string[];
  avoidTags: string[];
  // 축별 속성 매핑 (기여도 계산용)
  axisAttributes: {
    E: Array<keyof Heritage>;
    I: Array<keyof Heritage>;
    N: Array<keyof Heritage>;
    S: Array<keyof Heritage>;
    T: Array<keyof Heritage>;
    F: Array<keyof Heritage>;
    J: Array<keyof Heritage>;
    P: Array<keyof Heritage>;
  };
  // 페르소나 정의
  persona: {
    title: string;
    subtitle: string;
    explorationStyle: string;
    recommendationTone: string;
    courseTheme: string;
  };
}

export const ENHANCED_MBTI_PROFILES: Record<MBTIType, EnhancedMBTIProfile> = {
  INFP: {
    primary: ['emotionalScore', 'natureScore', 'imaginationScore'],
    secondary: ['quietScore', 'freeExploreScore'],
    avoid: ['popularityScore', 'structuredCourseScore'],
    hardFilters: [
      { attribute: 'emotionalScore', minScore: 70, penalty: -40, description: '감성적 분위기 필수' },
      { attribute: 'natureScore', minScore: 60, penalty: -25, description: '자연 친화성 필수' },
    ],
    preferredTags: ['사찰', '자연', '정원', '감성', '고요한', '힐링'],
    avoidTags: ['번잡한', '인파', '상업적'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore', 'emotionalScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore', 'natureScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore', 'natureScore'],
    },
    persona: {
      title: '감성형 사색 탐방가',
      subtitle: '자연과 감성의 조화를 찾는 여행자',
      explorationStyle: '조용한 사찰이나 자연 속에서 여유롭게 사색하며, 마음의 울림을 느끼는 것을 선호합니다.',
      recommendationTone: '이곳의 평화로운 분위기가 당신의 감성을 깨울 것입니다.',
      courseTheme: '감성 힐링 코스',
    },
  },
  
  ISFP: {
    primary: ['natureScore', 'emotionalScore', 'quietScore'],
    secondary: ['freeExploreScore', 'imaginationScore'],
    avoid: ['popularityScore', 'structuredCourseScore'],
    hardFilters: [
      { attribute: 'natureScore', minScore: 75, penalty: -35, description: '자연 친화성 필수' },
      { attribute: 'emotionalScore', minScore: 70, penalty: -35, description: '감성 분위기 필수' },
    ],
    preferredTags: ['자연', '정원', '사찰', '감성', '조용한'],
    avoidTags: ['번잡한', '현대적', '논리적'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore', 'natureScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore', 'natureScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '예술형 자연 탐방가',
      subtitle: '자연의 아름다움에 몰입하는 여행자',
      explorationStyle: '자연 속에서 감성적인 경험을 추구하며, 사진과 예술적 영감을 얻는 것을 좋아합니다.',
      recommendationTone: '이곳의 아름다운 풍경이 당신의 감성을 채워줄 것입니다.',
      courseTheme: '자연 예술 코스',
    },
  },

  INFJ: {
    primary: ['emotionalScore', 'imaginationScore', 'quietScore'],
    secondary: ['natureScore', 'historyScore'],
    avoid: ['popularityScore', 'analysisScore'],
    hardFilters: [
      { attribute: 'emotionalScore', minScore: 75, penalty: -35, description: '감성적 분위기 필수' },
      { attribute: 'quietScore', minScore: 65, penalty: -25, description: '조용함 필수' },
    ],
    preferredTags: ['사찰', '산사', '정원', '자연', '감성'],
    avoidTags: ['번화가', '현대적'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore', 'emotionalScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '통찰형 영적 탐방가',
      subtitle: '깊은 의미와 영감을 찾는 여행자',
      explorationStyle: '조용한 공간에서 깊은 사색과 통찰을 얻으며, 영적인 경험을 추구합니다.',
      recommendationTone: '이곳에서 깊은 통찰과 영감을 발견하시길 바랍니다.',
      courseTheme: '영적 사색 코스',
    },
  },

  INTJ: {
    primary: ['historyScore', 'analysisScore', 'structuredCourseScore'],
    secondary: ['imaginationScore', 'quietScore'],
    avoid: ['popularityScore', 'emotionalScore'],
    hardFilters: [
      { attribute: 'historyScore', minScore: 75, penalty: -35, description: '역사성 필수' },
      { attribute: 'analysisScore', minScore: 60, penalty: -25, description: '분석성 필수' },
    ],
    preferredTags: ['역사', '궁궐', '왕릉', '박물관', '유적지'],
    avoidTags: ['민속마을', '시장'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore', 'analysisScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore', 'historyScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '전략형 여행지 분석가',
      subtitle: '체계적인 역사 탐구를 선호하는 여행자',
      explorationStyle: '역사적 맥락을 분석하고 체계적으로 여행지를 탐구하며, 깊은 이해를 추구합니다.',
      recommendationTone: '이곳의 역사적 가치와 구조를 분석해보시길 권합니다.',
      courseTheme: '역사 분석 코스',
    },
  },

  INTP: {
    primary: ['analysisScore', 'imaginationScore', 'historyScore'],
    secondary: ['quietScore', 'freeExploreScore'],
    avoid: ['popularityScore', 'emotionalScore'],
    hardFilters: [
      { attribute: 'analysisScore', minScore: 60, penalty: -25, description: '분석성 필수' },
      { attribute: 'quietScore', minScore: 50, penalty: -20, description: '조용함 선호' },
    ],
    preferredTags: ['박물관', '유적지', '성곽', '역사'],
    avoidTags: ['테마파크', '상업지구'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore', 'analysisScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '논리형 여행지 탐구가',
      subtitle: '원리와 구조를 파헤치는 여행자',
      explorationStyle: '여행지의 특성과 원리를 탐구하며, 논리적 이해를 중시하는 탐방을 합니다.',
      recommendationTone: '이곳의 구조적 특징과 역사적 배경을 탐구해보세요.',
      courseTheme: '탐구 분석 코스',
    },
  },

  ENFP: {
    primary: ['freeExploreScore', 'imaginationScore', 'popularityScore'],
    secondary: ['emotionalScore', 'natureScore'],
    avoid: ['structuredCourseScore', 'analysisScore'],
    hardFilters: [
      { attribute: 'freeExploreScore', minScore: 75, penalty: -35, description: '자유탐방성 필수' },
    ],
    preferredTags: ['마을', '시장', '자연', '체험', '자유'],
    avoidTags: ['규제', '암울한', '경직된'],
    axisAttributes: {
      E: ['popularityScore', 'freeExploreScore'], I: ['quietScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore', 'natureScore'],
    },
    persona: {
      title: '영감형 발견 여행가',
      subtitle: '새로운 경험과 영감을 찾는 여행자',
      explorationStyle: '자유롭게 돌아다니며 새로운 발견과 영감을 얻는 것을 즐깁니다.',
      recommendationTone: '이곳에서 새로운 영감과 즐거운 발견을 경험하세요!',
      courseTheme: '발견 탐험 코스',
    },
  },

  ENFJ: {
    primary: ['emotionalScore', 'popularityScore', 'structuredCourseScore'],
    secondary: ['imaginationScore', 'historyScore'],
    avoid: ['quietScore', 'freeExploreScore'],
    hardFilters: [
      { attribute: 'emotionalScore', minScore: 70, penalty: -25, description: '감성적 분위기 필수' },
      { attribute: 'popularityScore', minScore: 65, penalty: -20, description: '인기도 선호' },
    ],
    preferredTags: ['궁궐', '사찰', '문화', '체험'],
    avoidTags: ['고립된', '어둠'],
    axisAttributes: {
      E: ['popularityScore', 'emotionalScore'], I: ['quietScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '카리스마형 문화 체험가',
      subtitle: '타인과 문화적 경험을 공유하는 여행자',
      explorationStyle: '다양한 사람들과 함께 문화적 경험을 나누며, 감동적인 순간을 만들어갑니다.',
      recommendationTone: '이곳에서 특별한 문화적 경험과 추억을 만드세요.',
      courseTheme: '문화 체험 코스',
    },
  },

  ENTJ: {
    primary: ['popularityScore', 'historyScore', 'structuredCourseScore'],
    secondary: ['analysisScore', 'imaginationScore'],
    avoid: ['quietScore', 'freeExploreScore'],
    hardFilters: [
      { attribute: 'popularityScore', minScore: 80, penalty: -35, description: '대표성/상징성 필수' },
      { attribute: 'structuredCourseScore', minScore: 65, penalty: -25, description: '정돈된 동선 필수' },
    ],
    preferredTags: ['궁궐', '대표유산', '유네스코', '역사'],
    avoidTags: ['소규모', '비인기'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore', 'historyScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '통솔형 상징 탐방가',
      subtitle: '상징적 여행지를 효율적으로 탐방하는 여행자',
      explorationStyle: '상징적인 여행지를 효율적으로 탐방하며, 가치 있는 경험을 추구합니다.',
      recommendationTone: '이 상징적인 여행지는 반드시 방문해야 할 곳입니다.',
      courseTheme: '상징 탐방 코스',
    },
  },

  ENTP: {
    primary: ['imaginationScore', 'popularityScore', 'freeExploreScore'],
    secondary: ['analysisScore', 'natureScore'],
    avoid: ['quietScore', 'structuredCourseScore'],
    hardFilters: [
      { attribute: 'imaginationScore', minScore: 70, penalty: -30, description: '상상력 자극 필수' },
      { attribute: 'freeExploreScore', minScore: 60, penalty: -25, description: '자유탐방성 선호' },
    ],
    preferredTags: ['성곽', '마을', '정원', '이야기'],
    avoidTags: ['암울한', '제한적'],
    axisAttributes: {
      E: ['popularityScore', 'freeExploreScore'], I: ['quietScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '혁신형 발견 탐험가',
      subtitle: '새로운 관점으로 여행지를 탐구하는 여행자',
      explorationStyle: '창의적인 관점으로 여행지를 탐구하며, 새로운 해석과 발견을 즐깁니다.',
      recommendationTone: '이곳에서 새로운 시각과 재미있는 발견을 해보세요!',
      courseTheme: '발견 탐구 코스',
    },
  },

  ISTJ: {
    primary: ['historyScore', 'structuredCourseScore', 'analysisScore'],
    secondary: ['quietScore', 'popularityScore'],
    avoid: ['freeExploreScore', 'imaginationScore'],
    hardFilters: [
      { attribute: 'historyScore', minScore: 80, penalty: -40, description: '역사성 필수' },
      { attribute: 'structuredCourseScore', minScore: 75, penalty: -30, description: '정돈된 동선 필수' },
    ],
    preferredTags: ['궁궐', '박물관', '유적지', '왕릉', '역사'],
    avoidTags: ['자유', '모호한', '현대적'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore', 'historyScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore', 'historyScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '정밀형 여행지 해설가',
      subtitle: '정확한 역사와 체계적 탐방을 선호하는 여행자',
      explorationStyle: '정확한 역사적 정보를 바탕으로 체계적으로 여행지를 탐방합니다.',
      recommendationTone: '이곳의 역사적 가치와 정확한 정보를 확인하세요.',
      courseTheme: '역사 학습 코스',
    },
  },

  ISFJ: {
    primary: ['emotionalScore', 'historyScore', 'quietScore'],
    secondary: ['structuredCourseScore', 'natureScore'],
    avoid: ['popularityScore', 'freeExploreScore'],
    hardFilters: [
      { attribute: 'emotionalScore', minScore: 65, penalty: -25, description: '감성적 분위기 선호' },
      { attribute: 'historyScore', minScore: 65, penalty: -25, description: '역사성 선호' },
    ],
    preferredTags: ['사찰', '전통', '정원', '왕릉'],
    avoidTags: ['현대적', '시끄러운'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore', 'emotionalScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '보호형 전통 수호자',
      subtitle: '전통과 감성을 소중히 여기는 여행자',
      explorationStyle: '전통적인 가치와 감성적인 분위기를 소중히 여기며 탐방합니다.',
      recommendationTone: '이곳의 전통적 가치와 따뜻한 분위기를 느껴보세요.',
      courseTheme: '전통 감성 코스',
    },
  },

  ESTJ: {
    primary: ['structuredCourseScore', 'popularityScore', 'historyScore'],
    secondary: ['analysisScore', 'structuredCourseScore'],
    avoid: ['freeExploreScore', 'quietScore'],
    hardFilters: [
      { attribute: 'structuredCourseScore', minScore: 85, penalty: -40, description: '정돈된 동선 필수' },
      { attribute: 'popularityScore', minScore: 75, penalty: -30, description: '대표성/상징성 필수' },
    ],
    preferredTags: ['궁궐', '대표유산', '박물관', '유네스코'],
    avoidTags: ['자유', '비조직적', '소규모'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore', 'historyScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '관리형 상징 탐방가',
      subtitle: '효율적으로 상징적 여행지를 탐방하는 여행자',
      explorationStyle: '효율적으로 동선을 짜서 상징적인 여행지를 체계적으로 탐방합니다.',
      recommendationTone: '이 상징적 여행지는 효율적으로 관람하실 수 있습니다.',
      courseTheme: '효율 탐방 코스',
    },
  },

  ESFJ: {
    primary: ['popularityScore', 'emotionalScore', 'structuredCourseScore'],
    secondary: ['historyScore', 'natureScore'],
    avoid: ['quietScore', 'analysisScore'],
    hardFilters: [
      { attribute: 'popularityScore', minScore: 75, penalty: -30, description: '인기도 필수' },
      { attribute: 'emotionalScore', minScore: 65, penalty: -20, description: '감성적 분위기 선호' },
    ],
    preferredTags: ['궁궐', '사찰', '전통', '문화', '인기'],
    avoidTags: ['고독한', '논리적'],
    axisAttributes: {
      E: ['popularityScore', 'emotionalScore'], I: ['quietScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '친화형 문화 나눔가',
      subtitle: '타인과 함께 문화를 즐기는 여행자',
      explorationStyle: '다양한 사람들과 함께 여행지를 나누며 즐기는 것을 선호합니다.',
      recommendationTone: '이곳에서 특별한 문화적 경험을 함께 나누세요.',
      courseTheme: '문화 공유 코스',
    },
  },

  ISTP: {
    primary: ['freeExploreScore', 'analysisScore', 'natureScore'],
    secondary: ['quietScore', 'historyScore'],
    avoid: ['popularityScore', 'emotionalScore'],
    hardFilters: [
      { attribute: 'freeExploreScore', minScore: 75, penalty: -35, description: '자유탐방성 필수' },
      { attribute: 'natureScore', minScore: 55, penalty: -20, description: '자연 친화성 선호' },
    ],
    preferredTags: ['성곽', '산성', '자연', '유적지'],
    avoidTags: ['감성적', '인파'],
    axisAttributes: {
      E: ['popularityScore'], I: ['quietScore', 'analysisScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore', 'natureScore'],
    },
    persona: {
      title: '실용형 탐구 실천가',
      subtitle: '직접 탐구하며 배우는 여행자',
      explorationStyle: '직접 자유롭게 탐방하며 여행지의 특성과 원리를 파악하는 것을 좋아합니다.',
      recommendationTone: '이곳을 자유롭게 탐방하며 구조를 파헤쳐보세요.',
      courseTheme: '탐구 실습 코스',
    },
  },

  ESTP: {
    primary: ['popularityScore', 'freeExploreScore', 'natureScore'],
    secondary: ['analysisScore', 'structuredCourseScore'],
    avoid: ['quietScore', 'emotionalScore'],
    hardFilters: [
      { attribute: 'popularityScore', minScore: 75, penalty: -30, description: '인기도 필수' },
      { attribute: 'freeExploreScore', minScore: 65, penalty: -25, description: '자유탐방성 선호' },
    ],
    preferredTags: ['체험', '시장', '성곽', '자연', '활동적'],
    avoidTags: ['조용한', '정적인'],
    axisAttributes: {
      E: ['popularityScore', 'freeExploreScore'], I: ['quietScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '모험형 현장 체험가',
      subtitle: '직접 몸으로 체험하는 여행자',
      explorationStyle: '활발하게 돌아다니며 직접 체험하고 즐기는 것을 선호합니다.',
      recommendationTone: '이곳에서 직접 체험하고 즐거운 시간을 보내세요!',
      courseTheme: '체험 활동 코스',
    },
  },

  ESFP: {
    primary: ['popularityScore', 'emotionalScore', 'freeExploreScore'],
    secondary: ['natureScore', 'imaginationScore'],
    avoid: ['quietScore', 'analysisScore'],
    hardFilters: [
      { attribute: 'popularityScore', minScore: 80, penalty: -35, description: '인기도 필수' },
      { attribute: 'emotionalScore', minScore: 65, penalty: -20, description: '감성적 분위기 선호' },
    ],
    preferredTags: ['시장', '마을', '체험', '인기', '생동감'],
    avoidTags: ['고요한', '암울한', '논리적'],
    axisAttributes: {
      E: ['popularityScore', 'emotionalScore'], I: ['quietScore'],
      N: ['imaginationScore'], S: ['historyScore'],
      T: ['analysisScore'], F: ['emotionalScore'],
      J: ['structuredCourseScore'], P: ['freeExploreScore'],
    },
    persona: {
      title: '연예형 에너지 여행자',
      subtitle: '생동감 넘치는 경험을 추구하는 여행자',
      explorationStyle: '생동감 넘치는 분위기에서 다양한 체험을 즐기며 즐거움을 나눕니다.',
      recommendationTone: '이곳에서 생동감 넘치는 즐거운 경험을 하세요!',
      courseTheme: '생동감 체험 코스',
    },
  },
};

// ============================================================
// 3. 고도화된 점수 계산 (Score Breakdown 포함)
// ============================================================

/**
 * 축별 기여도 계산
 */
function calculateAxisContribution(
  heritage: Heritage,
  profile: EnhancedMBTIProfile
): ScoreBreakdown['axisContribution'] {
  const calcAxisScore = (positiveAttrs: Array<keyof Heritage>, negativeAttrs: Array<keyof Heritage>) => {
    const pos = positiveAttrs.reduce((sum, attr) => sum + (heritage[attr] as number), 0) / positiveAttrs.length;
    const neg = negativeAttrs.reduce((sum, attr) => sum + (heritage[attr] as number), 0) / negativeAttrs.length;
    return pos - neg;
  };

  return {
    EI: calcAxisScore(profile.axisAttributes.E, profile.axisAttributes.I),
    NS: calcAxisScore(profile.axisAttributes.N, profile.axisAttributes.S),
    TF: calcAxisScore(profile.axisAttributes.T, profile.axisAttributes.F),
    JP: calcAxisScore(profile.axisAttributes.J, profile.axisAttributes.P),
  };
}

/**
 * 고도화된 점수 계산 (Score Breakdown 포함)
 */
export function calculateEnhancedMatchScore(
  heritage: Heritage,
  mbti: MBTIType
): { score: number; breakdown: ScoreBreakdown } {
  const profile = ENHANCED_MBTI_PROFILES[mbti];
  
  const breakdown: ScoreBreakdown = {
    total: 0,
    components: {
      primary: [],
      secondary: [],
      avoid: [],
      hardFilters: [],
      tags: [],
    },
    axisContribution: calculateAxisContribution(heritage, profile),
  };

  let totalScore = 0;
  let totalWeight = 0;

  // Primary 속성 (가중치 5)
  profile.primary.forEach((attr) => {
    const score = heritage[attr] as number;
    const weighted = score * 5;
    breakdown.components.primary.push({
      attr: attr.toString(),
      rawScore: score,
      weight: 5,
      weightedScore: weighted,
    });
    totalScore += weighted;
    totalWeight += 5;
  });

  // Secondary 속성 (가중치 2)
  profile.secondary.forEach((attr) => {
    const score = heritage[attr] as number;
    const weighted = score * 2;
    breakdown.components.secondary.push({
      attr: attr.toString(),
      rawScore: score,
      weight: 2,
      weightedScore: weighted,
    });
    totalScore += weighted;
    totalWeight += 2;
  });

  // Avoid 속성 (가중치 -4)
  profile.avoid.forEach((attr) => {
    const score = heritage[attr] as number;
    const penalty = -score * 4;
    breakdown.components.avoid.push({
      attr: attr.toString(),
      rawScore: score,
      weight: -4,
      penalty,
    });
    totalScore += penalty;
    totalWeight += 4;
  });

  // 하드 필터 적용
  profile.hardFilters.forEach((filter) => {
    const score = heritage[filter.attribute] as number;
    const passed = score >= filter.minScore;
    let penalty = 0;
    
    if (!passed) {
      penalty = filter.penalty * ((filter.minScore - score) / filter.minScore);
      totalScore += penalty;
    }
    
    breakdown.components.hardFilters.push({
      attr: filter.attribute.toString(),
      passed,
      penalty,
      threshold: filter.minScore,
    });
  });

  // 특수 케이스: I/FP 유형의 popularityScore 역 패널티
  if ((mbti.includes('I') || mbti.includes('FP')) && heritage.popularityScore > 80) {
    const specialPenalty = -(heritage.popularityScore - 80) * 0.8;
    totalScore += specialPenalty;
  }
  
  // 특수 케이스: P 유형의 structuredCourseScore 역 패널티
  if (mbti.includes('P') && heritage.structuredCourseScore > 50) {
    const specialPenalty = -(heritage.structuredCourseScore - 50) * 0.6;
    totalScore += specialPenalty;
  }

  // 태그 매칭
  heritage.tags.forEach((tag) => {
    const preferredMatch = profile.preferredTags.find((pt) => tag.includes(pt));
    const avoidMatch = profile.avoidTags.find((at) => tag.includes(at));
    
    if (preferredMatch) {
      breakdown.components.tags.push({ tag, type: 'preferred', score: 25 });
      totalScore += 25;
    } else if (avoidMatch) {
      breakdown.components.tags.push({ tag, type: 'avoid', score: -20 });
      totalScore -= 20;
    }
  });
  totalWeight += 5;

  // 정규화 (0-100 범위)
  const normalizedScore = Math.max(0, Math.min(100, 
    (totalScore / (totalWeight * 100)) * 100 + 50
  ));

  breakdown.total = Math.round(normalizedScore);
  return { score: breakdown.total, breakdown };
}

// ============================================================
// 4. 설명 가능성 강화 (Explanation Generation)
// ============================================================

/**
 * 속성별 MBTI 맥락 메시지
 */
const ATTRIBUTE_CONTEXT_MESSAGES: Record<string, Record<string, string>> = {
  emotionalScore: {
    INFP: '감성적인 분위기에서 마음의 울림을 느낄 수 있어요',
    INFJ: '정서적인 깊이와 영감을 얻을 수 있는 공간이에요',
    ISFP: '아름다운 분위기에 감성이 자극되는 곳이에요',
    ENFJ: '감동적인 경험을 나누기 좋은 장소예요',
    ESFJ: '따뜻한 감성을 느낄 수 있는 곳이에요',
    default: '감성적인 분위기가 매력적인 장소',
  },
  natureScore: {
    INFP: '자연 속에서 힐링과 재충전을 할 수 있어요',
    ISFP: '자연의 아름다움에 몰입하며 영감을 얻을 수 있어요',
    INFJ: '자연과 조화롭게 어우러진 평화로운 공간이에요',
    ISTP: '자연 속에서 자유롭게 탐구할 수 있어요',
    default: '자연과 어우러진 힐링 환경',
  },
  historyScore: {
    INTJ: '깊은 역사적 맥락을 분석하며 탐구하기 좋아요',
    ISTJ: '정확한 역사적 정보를 체계적으로 학습할 수 있어요',
    ESTJ: '상징적인 역사적 가치를 효율적으로 탐방할 수 있어요',
    ENTJ: '중요한 역사적 의미를 이해할 수 있는 곳이에요',
    default: '역사적 가치가 높은 유산',
  },
  structuredCourseScore: {
    ESTJ: '동선이 잘 정돈되어 효율적으로 관람할 수 있어요',
    ISTJ: '체계적인 코스로 꼼꼼하게 탐방할 수 있어요',
    ENTJ: '효율적인 동선으로 가치 있는 경험을 할 수 있어요',
    INTJ: '잘 구성된 코스로 깊이 있게 탐구할 수 있어요',
    default: '정돈된 동선으로 편리한 관람',
  },
  freeExploreScore: {
    INFP: '자유롭게 걸으며 자신만의 발견을 할 수 있어요',
    ENFP: '제약 없이 자유롭게 탐험하며 영감을 얻을 수 있어요',
    ISTP: '자유롭게 탐방하며 구조를 파헤칠 수 있어요',
    ISFP: '자유로운 분위기에서 감성을 채울 수 있어요',
    default: '자유로운 탐방이 가능한 공간',
  },
  popularityScore: {
    ESTJ: '상징적이고 대표적인 가치 있는 방문지예요',
    ENTJ: '꼭 방문해야 할 중요한 문화유산이에요',
    ESFJ: '많은 사람들이 인정하는 인기 있는 명소예요',
    ENFJ: '함께 방문하기 좋은 대표적인 유산이에요',
    default: '상징적이고 대표적인 유산',
  },
  quietScore: {
    INFP: '조용한 분위기에서 사색과 명상을 즐길 수 있어요',
    INFJ: '고요한 공간에서 깊은 통찰을 얻을 수 있어요',
    INTJ: '한적한 환경에서 집중하며 탐구할 수 있어요',
    ISFJ: '조용한 분위기에서 편안하게 관람할 수 있어요',
    default: '조용하고 사색적인 분위기',
  },
  imaginationScore: {
    INFP: '상상력을 자극하는 이야기와 해석의 여지가 풍부해요',
    ENFP: '창의적인 관점으로 새로운 발견을 할 수 있어요',
    INFJ: '풍부한 상상력으로 깊은 통찰을 얻을 수 있어요',
    ENTP: '창의적인 해석과 재미있는 발견이 가능해요',
    default: '상상력을 자극하는 이야기성',
  },
  analysisScore: {
    INTJ: '구조와 원리를 분석하며 깊이 있게 탐구할 수 있어요',
    INTP: '논리적으로 분석하며 지식을 쌓을 수 있어요',
    ISTJ: '체계적으로 분석하며 정확한 이해를 할 수 있어요',
    ISTP: '실용적인 관점에서 구조를 파헤칠 수 있어요',
    default: '분석적 탐구가 가능한 유산',
  },
};

/**
 * 고도화된 매칭 설명 생성
 */
export function generateEnhancedExplanation(
  heritage: Heritage,
  mbti: MBTIType,
  breakdown: ScoreBreakdown
): MatchExplanation {
  const profile = ENHANCED_MBTI_PROFILES[mbti];
  
  // 1. 핵심 속성 추출 (가중치 기여도 상위 3개)
  const allComponents = [
    ...breakdown.components.primary.map(c => ({ ...c, type: 'primary' as const })),
    ...breakdown.components.secondary.map(c => ({ ...c, type: 'secondary' as const })),
  ];
  
  const keyAttributes = allComponents
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 3)
    .map(c => c.attr);

  // 2. 상위 태그 추출
  const topTags = heritage.tags
    .filter(tag => profile.preferredTags.some(pt => tag.includes(pt)))
    .slice(0, 3);

  // 3. MBTI 적합도 설명 생성
  const getContextMessage = (attr: string) => {
    const messages = ATTRIBUTE_CONTEXT_MESSAGES[attr];
    return messages?.[mbti] || messages?.default || `${attr}가 특징인 장소`;
  };

  const keyMessages = keyAttributes.map(getContextMessage);
  const mbtiFit = keyMessages.join(' / ');

  // 4. 축별 정렬 정보
  const axisAlignment = [
    {
      axis: 'E-I',
      direction: breakdown.axisContribution.EI > 0 ? 'E (외향)' : 'I (내향)',
      strength: Math.abs(breakdown.axisContribution.EI),
    },
    {
      axis: 'N-S',
      direction: breakdown.axisContribution.NS > 0 ? 'N (직관)' : 'S (감각)',
      strength: Math.abs(breakdown.axisContribution.NS),
    },
    {
      axis: 'T-F',
      direction: breakdown.axisContribution.TF > 0 ? 'T (사고)' : 'F (감정)',
      strength: Math.abs(breakdown.axisContribution.TF),
    },
    {
      axis: 'J-P',
      direction: breakdown.axisContribution.JP > 0 ? 'J (계획)' : 'P (자유)',
      strength: Math.abs(breakdown.axisContribution.JP),
    },
  ].sort((a, b) => b.strength - a.strength);

  return {
    topTags: topTags.length > 0 ? topTags : heritage.tags.slice(0, 3),
    keyAttributes,
    mbtiFit,
    axisAlignment,
  };
}

// ============================================================
// 5. 고도화된 다양성 로직 (점수 구간별 차등 적용)
// ============================================================

interface ScoredHeritage {
  heritage: Heritage;
  score: number;
  breakdown: ScoreBreakdown;
  explanation: MatchExplanation;
  quality: 'excellent' | 'good' | 'acceptable';
}

/**
 * 품질 등급 결정
 */
function determineQuality(score: number): 'excellent' | 'good' | 'acceptable' {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  return 'acceptable';
}

/**
 * 카테고리 추출
 */
function getCategory(heritage: Heritage): string {
  const tagCategories: Record<string, string> = {
    '궁궐': '궁궐', '사찰': '사찰', '산사': '사찰', '왕릉': '왕릉',
    '박물관': '박물관', '성곽': '성곽', '산성': '성곽',
    '민속마을': '마을', '마을': '마을', '정원': '정원', '유적지': '유적지',
  };
  
  for (const tag of heritage.tags) {
    for (const [key, category] of Object.entries(tagCategories)) {
      if (tag.includes(key)) return category;
    }
  }
  return '기타';
}

/**
 * 특성 유사도 계산 (중복 방지용)
 */
function calculateFeatureSimilarity(h1: Heritage, h2: Heritage): number {
  const attributes: Array<keyof Heritage> = [
    'popularityScore', 'quietScore', 'imaginationScore', 'historyScore',
    'emotionalScore', 'structuredCourseScore', 'freeExploreScore', 'natureScore'
  ];
  
  const diff = attributes.reduce((sum, attr) => {
    return sum + Math.abs((h1[attr] as number) - (h2[attr] as number));
  }, 0);
  
  return 1 - (diff / (attributes.length * 100));
}

/**
 * 개선된 다양성 로직 - 단순하고 효과적으로
 */
function applyEnhancedDiversity(
  scoredList: ScoredHeritage[],
  limit: number
): ScoredHeritage[] {
  const selected: ScoredHeritage[] = [];
  const categoryCount: Record<string, number> = {};
  const regionCount: Record<string, number> = {};

  // 점수순 정렬 (이미 정렬되어 있지만 안전을 위해)
  const sorted = [...scoredList].sort((a, b) => b.score - a.score);

  for (const item of sorted) {
    if (selected.length >= limit) break;
    
    const category = getCategory(item.heritage);
    const region = item.heritage.region;
    
    // 통일된 제한: 같은 카테고리 최대 2개, 같은 지역 최대 2개
    if ((categoryCount[category] || 0) >= 2) continue;
    if ((regionCount[region] || 0) >= 2) continue;
    
    // 유사도 체크 (75% 이상 유사하면 스킵)
    const tooSimilar = selected.some(s => 
      calculateFeatureSimilarity(s.heritage, item.heritage) > 0.75
    );
    if (tooSimilar) continue;
    
    selected.push(item);
    categoryCount[category] = (categoryCount[category] || 0) + 1;
    regionCount[region] = (regionCount[region] || 0) + 1;
  }

  // 만약 제한 때문에 부족하면, 제한 완화해서 채움
  if (selected.length < limit) {
    for (const item of sorted) {
      if (selected.length >= limit) break;
      if (selected.some(s => s.heritage.id === item.heritage.id)) continue;
      
      selected.push(item);
      
      const category = getCategory(item.heritage);
      const region = item.heritage.region;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      regionCount[region] = (regionCount[region] || 0) + 1;
    }
  }

  return selected;
}

// ============================================================
// 6. 메인 추천 함수 (고도화된 버전)
// ============================================================

/**
 * 고도화된 MBTI 기반 문화유산 추천
 */
export function getEnhancedRecommendations(
  mbti: MBTIType,
  region: Region,
  limit: number = 5
): EnhancedRecommendedHeritage[] {
  const profile = ENHANCED_MBTI_PROFILES[mbti];
  
  // 1. 지역 필터링
  let candidates: Heritage[] =
    region === 'all'
      ? heritageData
      : heritageData.filter((h) => h.region === region);

  // 2. 점수 계산 및 필터링 (품질 게이트: 최소 60점)
  const scoredCandidates: ScoredHeritage[] = candidates
    .map((heritage) => {
      const { score, breakdown } = calculateEnhancedMatchScore(heritage, mbti);
      const explanation = generateEnhancedExplanation(heritage, mbti, breakdown);
      const quality = determineQuality(score);
      return { heritage, score, breakdown, explanation, quality };
    })
    .filter((item) => item.score >= 45); // 품질 게이트: 45점 이상 (너무 엄격하면 다양성 저하)

  // 3. 상위 40%를 후보로 (품질-다양성 균형)
  const topPercentile = Math.max(10, Math.ceil(scoredCandidates.length * 0.4));
  const topCandidates = scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, topPercentile);

  // 4. 고도화된 다양성 적용
  const selected = applyEnhancedDiversity(topCandidates, limit);

  // 5. 결과 형식 변환
  return selected.map((item, index) => ({
    ...item.heritage,
    matchScore: item.score,
    matchReasons: [item.explanation.mbtiFit, ...item.explanation.topTags.map(t => `${t} 특징`)].slice(0, 3),
    rank: index + 1,
    scoreBreakdown: item.breakdown,
    explanation: item.explanation,
    quality: item.quality,
  }));
}

// ============================================================
// 7. 고도화된 코스 추천
// ============================================================

// 당일 이동 가능한 인접 지역 맵
const REGION_ADJACENCY: Record<string, string[]> = {
  seoul: ['gyeonggi'],
  gyeonggi: ['seoul', 'gangwon', 'chungcheong'],
  gangwon: ['gyeonggi', 'gyeongsang'],
  chungcheong: ['gyeonggi', 'jeolla', 'gyeongsang'],
  jeolla: ['chungcheong', 'gyeongsang'],
  gyeongsang: ['gangwon', 'chungcheong', 'jeolla'],
  jeju: [],
};

/**
 * MBTI별 선호 지역 우선순위
 *
 * 점수 합산만으로 지역을 선택하면 제주(전 속성 점수 90+)가 모든 MBTI에서 독점함.
 * MBTI 성향에 맞는 지역을 먼저 선택하고, 해당 지역 내에서 최고 점수 장소를 고른다.
 *
 * 배치 기준:
 *  - T/J 유형: 서울(궁궐·박물관), 경상도(서원·사찰·유적)  → 역사·분석 콘텐츠 풍부
 *  - F/I 유형: 전라도(순천만·청산도·사찰), 강원도(설악·월정사)  → 자연·감성 콘텐츠
 *  - E/P 유형: 강원도, 전라도, 제주  → 자유탐방·체험 다양
 *  - 제주는 ESFP·ISFP 등 순수 자연·감성 유형에게만 1·2순위 배정
 */
const MBTI_REGION_ORDER: Record<MBTIType, string[]> = {
  // ─── 내향·사고 (IT) ────────────────────────────────────────────
  INTJ: ['gyeongsang', 'seoul',      'chungcheong', 'gyeonggi'],
  INTP: ['gyeongsang', 'seoul',      'gangwon',     'chungcheong'],
  ISTJ: ['seoul',      'gyeongsang', 'chungcheong', 'gyeonggi'],
  ISTP: ['gangwon',    'gyeongsang', 'chungcheong', 'jeolla'],
  // ─── 내향·감정 (IF) ────────────────────────────────────────────
  INFJ: ['gangwon',    'chungcheong','jeolla',      'gyeongsang'],
  INFP: ['jeolla',     'gangwon',    'jeju',        'gyeonggi'],
  ISFJ: ['chungcheong','gyeongsang', 'jeolla',      'gyeonggi'],
  ISFP: ['jeolla',     'jeju',       'gangwon',     'gyeongsang'],
  // ─── 외향·사고 (ET) ────────────────────────────────────────────
  ENTJ: ['seoul',      'gyeongsang', 'gyeonggi',    'chungcheong'],
  ENTP: ['seoul',      'gangwon',    'gyeongsang',  'jeolla'],
  ESTJ: ['seoul',      'gyeongsang', 'gyeonggi',    'chungcheong'],
  ESTP: ['gangwon',    'gyeongsang', 'jeju',        'jeolla'],
  // ─── 외향·감정 (EF) ────────────────────────────────────────────
  ENFJ: ['seoul',      'jeolla',     'gyeonggi',    'gangwon'],
  ENFP: ['gangwon',    'jeolla',     'jeju',        'gyeonggi'],
  ESFJ: ['seoul',      'jeolla',     'gyeonggi',    'gangwon'],
  ESFP: ['jeju',       'jeolla',     'gangwon',     'gyeongsang'],
};

/**
 * 코스 전용 다양성 필터 - 지역 제한 없이 카테고리·유사도만 체크
 * (지역 선정은 generateEnhancedCourse에서 사전 처리)
 */
function applyCourseDiversity(
  scoredList: ScoredHeritage[],
  limit: number
): ScoredHeritage[] {
  const selected: ScoredHeritage[] = [];
  const categoryCount: Record<string, number> = {};

  const sorted = [...scoredList].sort((a, b) => b.score - a.score);

  for (const item of sorted) {
    if (selected.length >= limit) break;

    const category = getCategory(item.heritage);
    if ((categoryCount[category] || 0) >= 2) continue;

    const tooSimilar = selected.some(
      (s) => calculateFeatureSimilarity(s.heritage, item.heritage) > 0.75
    );
    if (tooSimilar) continue;

    selected.push(item);
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  }

  // 제한으로 부족한 경우 완화해서 채움
  if (selected.length < limit) {
    for (const item of sorted) {
      if (selected.length >= limit) break;
      if (selected.some((s) => s.heritage.id === item.heritage.id)) continue;
      selected.push(item);
    }
  }

  return selected;
}

export interface EnhancedCourse {
  title: string;
  subtitle: string;
  theme: string;
  description: string;
  flow: 'relaxed' | 'structured' | 'dynamic' | 'immersive';
  region: string;
  sites: Array<{
    id: string;
    name: string;
    city: string;
    image: string;
    summary: string;
    role: string;
  }>;
}

/**
 * 페르소나 기반 코스 생성 - 같은 지역(또는 인접 지역) 내에서만 장소를 구성해
 * 하루 동안 현실적으로 이동 가능한 코스를 추천한다.
 */
export function generateEnhancedCourse(mbti: MBTIType): EnhancedCourse {
  const profile = ENHANCED_MBTI_PROFILES[mbti];

  // 1. 전체 유산 점수 계산
  const allScored: ScoredHeritage[] = heritageData
    .map((heritage) => {
      const { score, breakdown } = calculateEnhancedMatchScore(heritage, mbti);
      const explanation = generateEnhancedExplanation(heritage, mbti, breakdown);
      const quality = determineQuality(score);
      return { heritage, score, breakdown, explanation, quality };
    })
    .filter((item) => item.score >= 45);

  // 2. 지역별 그룹화
  const byRegion: Record<string, ScoredHeritage[]> = {};
  for (const item of allScored) {
    const r = item.heritage.region as string;
    if (!byRegion[r]) byRegion[r] = [];
    byRegion[r].push(item);
  }

  // 3. MBTI 선호 지역 순서대로, 후보가 3개 이상인 첫 번째 지역 선택
  //    (단순 점수 합산 방식은 전 속성 고득점인 제주가 모든 MBTI에서 독점하는 문제 발생)
  const regionOrder = MBTI_REGION_ORDER[mbti] ?? [];
  let bestRegion = '';

  for (const region of regionOrder) {
    const sites = byRegion[region];
    if (sites && sites.length >= 3) {
      bestRegion = region;
      break;
    }
  }

  // fallback: 선호 지역에 후보가 모두 부족할 때만 점수 합산 방식 사용
  if (!bestRegion) {
    let bestScore = -1;
    for (const [region, sites] of Object.entries(byRegion)) {
      const topScore = [...sites]
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .reduce((sum, s) => sum + s.score, 0);
      if (topScore > bestScore) {
        bestScore = topScore;
        bestRegion = region;
      }
    }
  }

  // 4. 베스트 지역 풀 구성 - 사이트가 부족하면 인접 지역에서 보충
  const pool: ScoredHeritage[] = [...(byRegion[bestRegion] ?? [])];
  if (pool.length < 4) {
    const adjacent = REGION_ADJACENCY[bestRegion] ?? [];
    for (const adj of adjacent) {
      if (pool.length >= 4) break;
      pool.push(...(byRegion[adj] ?? []));
    }
  }

  // 5. 코스 전용 다양성 적용 (지역 제한 없이 카테고리·유사도만 체크)
  const poolSorted = pool.sort((a, b) => b.score - a.score);
  const selected = applyCourseDiversity(poolSorted, 4);

  // 코스 흐름 결정
  let flow: EnhancedCourse['flow'];
  if (mbti.includes('P') && mbti.includes('E')) flow = 'dynamic';
  else if (mbti.includes('J')) flow = 'structured';
  else if (mbti.includes('I') && mbti.includes('F')) flow = 'immersive';
  else flow = 'relaxed';

  const roles = ['첫 번째 목적지', '핵심 경험지', '깊이 탐방지', '마무리 장소'];

  return {
    title: profile.persona.courseTheme,
    subtitle: profile.persona.subtitle,
    theme: profile.persona.title,
    description: `${profile.persona.explorationStyle} ${profile.persona.recommendationTone}`,
    flow,
    region: bestRegion,
    sites: selected.slice(0, 4).map((item, i) => ({
      id: item.heritage.id,
      name: item.heritage.name,
      city: item.heritage.city,
      image: item.heritage.image,
      summary: item.heritage.summary,
      role: roles[i] || '추가 탐방지',
    })),
  };
}

// ============================================================
// 8. 디버그 및 검증 유틸리티
// ============================================================

export interface DebugComparisonResult {
  mbti: MBTIType;
  recommendations: Array<{
    name: string;
    score: number;
    quality: string;
    category: string;
    region: string;
    topAttributes: string[];
    ei_contribution: number;
    ns_contribution: number;
    tf_contribution: number;
    jp_contribution: number;
  }>;
  stats: {
    avgQuiet: number;
    avgHistory: number;
    avgEmotional: number;
    avgStructured: number;
    avgFreeExplore: number;
    avgNature: number;
  };
}

/**
 * MBTI별 상세 디버그 정보 출력
 */
export function debugEnhancedRecommendations(
  mbti: MBTIType,
  region: Region = 'all'
): void {
  console.log(`\n========== ${mbti} 고도화 추천 결과 ==========`);
  console.log('페르소나:', ENHANCED_MBTI_PROFILES[mbti].persona.title);
  console.log('Primary:', ENHANCED_MBTI_PROFILES[mbti].primary);
  console.log('');

  const recommendations = getEnhancedRecommendations(mbti, region, 5);

  recommendations.forEach((rec, idx) => {
    console.log(`\n[${idx + 1}] ${rec.name} (${rec.matchScore}점, ${rec.quality})`);
    console.log(`   지역: ${rec.city} (${rec.region})`);
    console.log(`   카테고리: ${getCategory(rec)}`);
    console.log(`   태그: ${rec.tags.join(', ')}`);
    console.log(`   핵심 속성:`, rec.explanation.keyAttributes);
    console.log(`   축별 기여도:`, {
      EI: rec.scoreBreakdown.axisContribution.EI.toFixed(1),
      NS: rec.scoreBreakdown.axisContribution.NS.toFixed(1),
      TF: rec.scoreBreakdown.axisContribution.TF.toFixed(1),
      JP: rec.scoreBreakdown.axisContribution.JP.toFixed(1),
    });
    console.log(`   설명: ${rec.explanation.mbtiFit}`);
  });

  console.log('\n=====================================\n');
}

/**
 * 두 MBTI 상세 비교
 */
export function compareEnhancedMBTI(
  mbti1: MBTIType,
  mbti2: MBTIType,
  region: Region = 'all'
): void {
  const recs1 = getEnhancedRecommendations(mbti1, region, 5);
  const recs2 = getEnhancedRecommendations(mbti2, region, 5);

  const names1 = recs1.map(r => r.name);
  const names2 = recs2.map(r => r.name);
  const common = names1.filter(n => names2.includes(n));

  console.log(`\n########## ${mbti1} vs ${mbti2} 상세 비교 ##########\n`);

  console.log(`${mbti1} (${ENHANCED_MBTI_PROFILES[mbti1].persona.title}):`);
  recs1.forEach((r, i) => console.log(`  ${i + 1}. ${r.name} (${r.matchScore}점, ${r.quality})`));

  console.log(`\n${mbti2} (${ENHANCED_MBTI_PROFILES[mbti2].persona.title}):`);
  recs2.forEach((r, i) => console.log(`  ${i + 1}. ${r.name} (${r.matchScore}점, ${r.quality})`));

  console.log(`\n중복: ${common.length}개 ${common.length > 0 ? '(' + common.join(', ') + ')' : ''}`);

  // 평균 점수 비교
  const avg = (recs: EnhancedRecommendedHeritage[], attr: keyof Heritage) => 
    recs.reduce((sum, r) => sum + (r[attr] as number), 0) / recs.length;

  console.log('\n--- 평균 속성 비교 ---');
  console.log(`              ${mbti1}    ${mbti2}    차이`);
  console.log(`조용함:       ${avg(recs1, 'quietScore').toFixed(1)}   ${avg(recs2, 'quietScore').toFixed(1)}   ${(avg(recs1, 'quietScore') - avg(recs2, 'quietScore')).toFixed(1)}`);
  console.log(`역사성:       ${avg(recs1, 'historyScore').toFixed(1)}   ${avg(recs2, 'historyScore').toFixed(1)}   ${(avg(recs1, 'historyScore') - avg(recs2, 'historyScore')).toFixed(1)}`);
  console.log(`감성:         ${avg(recs1, 'emotionalScore').toFixed(1)}   ${avg(recs2, 'emotionalScore').toFixed(1)}   ${(avg(recs1, 'emotionalScore') - avg(recs2, 'emotionalScore')).toFixed(1)}`);
  console.log(`정돈:         ${avg(recs1, 'structuredCourseScore').toFixed(1)}   ${avg(recs2, 'structuredCourseScore').toFixed(1)}   ${(avg(recs1, 'structuredCourseScore') - avg(recs2, 'structuredCourseScore')).toFixed(1)}`);
  console.log(`자유탐방:     ${avg(recs1, 'freeExploreScore').toFixed(1)}   ${avg(recs2, 'freeExploreScore').toFixed(1)}   ${(avg(recs1, 'freeExploreScore') - avg(recs2, 'freeExploreScore')).toFixed(1)}`);
  console.log(`자연:         ${avg(recs1, 'natureScore').toFixed(1)}   ${avg(recs2, 'natureScore').toFixed(1)}   ${(avg(recs1, 'natureScore') - avg(recs2, 'natureScore')).toFixed(1)}`);

  console.log('\n####################################\n');
}

/**
 * 축별 분리도 검증
 */
export function validateAxisSeparation(): void {
  console.log('\n========== 축별 분리도 검증 ==========\n');

  const iTypes: MBTIType[] = ['INFP', 'ISFP', 'INFJ', 'ISFJ', 'INTJ', 'ISTJ', 'INTP', 'ISTP'];
  const eTypes: MBTIType[] = ['ENFP', 'ESFP', 'ENFJ', 'ESFJ', 'ENTJ', 'ESTJ', 'ENTP', 'ESTP'];
  const jTypes: MBTIType[] = ['INTJ', 'INFJ', 'ISTJ', 'ISFJ', 'ENTJ', 'ENFJ', 'ESTJ', 'ESFJ'];
  const pTypes: MBTIType[] = ['INTP', 'INFP', 'ISTP', 'ISFP', 'ENTP', 'ENFP', 'ESTP', 'ESFP'];
  const tTypes: MBTIType[] = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'ISTJ', 'ISTP', 'ESTJ', 'ESTP'];
  const fTypes: MBTIType[] = ['INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISFJ', 'ISFP', 'ESFJ', 'ESFP'];

  const calcAvg = (types: MBTIType[], attr: keyof Heritage) => {
    const recs = types.flatMap(mbti => getEnhancedRecommendations(mbti, 'all', 3));
    return recs.reduce((sum, r) => sum + (r[attr] as number), 0) / recs.length;
  };

  const iQuiet = calcAvg(iTypes, 'quietScore');
  const eQuiet = calcAvg(eTypes, 'quietScore');
  const jStruct = calcAvg(jTypes, 'structuredCourseScore');
  const pStruct = calcAvg(pTypes, 'structuredCourseScore');
  const tEmo = calcAvg(tTypes, 'emotionalScore');
  const fEmo = calcAvg(fTypes, 'emotionalScore');

  console.log('E-I 축 (조용함):');
  console.log(`  I 계열 평균: ${iQuiet.toFixed(1)}`);
  console.log(`  E 계열 평균: ${eQuiet.toFixed(1)}`);
  console.log(`  차이: ${(iQuiet - eQuiet).toFixed(1)} ${(iQuiet - eQuiet) >= 15 ? '✓' : '✗'}`);

  console.log('\nJ-P 축 (정돈):');
  console.log(`  J 계열 평균: ${jStruct.toFixed(1)}`);
  console.log(`  P 계열 평균: ${pStruct.toFixed(1)}`);
  console.log(`  차이: ${(jStruct - pStruct).toFixed(1)} ${(jStruct - pStruct) >= 15 ? '✓' : '✗'}`);

  console.log('\nT-F 축 (감성):');
  console.log(`  T 계열 평균: ${tEmo.toFixed(1)}`);
  console.log(`  F 계열 평균: ${fEmo.toFixed(1)}`);
  console.log(`  차이: ${(fEmo - tEmo).toFixed(1)} ${(fEmo - tEmo) >= 12 ? '✓' : '✗'}`);

  console.log('\n=====================================\n');
}

/**
 * 엄격한 Acceptance Criteria 검증
 */
export function validateStrictCriteria(): boolean {
  console.log('\n########## 엄격한 Acceptance Criteria 검증 ##########\n');

  const testCases: Array<[MBTIType, MBTIType, string]> = [
    ['INFP', 'ESTJ', '극단적 차이'],
    ['ISFP', 'ENTJ', '극단적 차이'],
    ['INTJ', 'ESFP', '극단적 차이'],
    ['INFJ', 'ESTP', '극단적 차이'],
  ];

  let allPassed = true;

  testCases.forEach(([mbti1, mbti2, desc]) => {
    const recs1 = getEnhancedRecommendations(mbti1, 'all', 5);
    const recs2 = getEnhancedRecommendations(mbti2, 'all', 5);
    const names1 = recs1.map(r => r.name);
    const names2 = recs2.map(r => r.name);
    const common = names1.filter(n => names2.includes(n));

    const passed = common.length <= 1;
    allPassed = allPassed && passed;

    console.log(`${mbti1} vs ${mbti2} (${desc}):`);
    console.log(`  중복: ${common.length}개 ${common.length > 0 ? '(' + common.join(', ') + ')' : ''}`);
    console.log(`  기준: 1개 이하 | 결과: ${passed ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log('');
  });

  // 축별 검증
  validateAxisSeparation();

  console.log(`\n최종 결과: ${allPassed ? '모든 기준 충족 ✓' : '일부 기준 미달 ✗'}`);
  console.log('\n##################################################\n');

  return allPassed;
}

// ============================================================
// 9. 기존 호환성 유지 (legacy exports)
// ============================================================

export function getRecommendations(
  mbti: MBTIType,
  region: Region,
  limit: number = 5
): RecommendedHeritage[] {
  const enhanced = getEnhancedRecommendations(mbti, region, limit);
  return enhanced.map(e => ({
    ...e,
    matchReasons: e.explanation.keyAttributes.slice(0, 3),
  }));
}

export function calculateMatchScore(heritage: Heritage, mbti: MBTIType): number {
  return calculateEnhancedMatchScore(heritage, mbti).score;
}

export function generateMatchReasons(heritage: Heritage, mbti: MBTIType): string[] {
  const { breakdown } = calculateEnhancedMatchScore(heritage, mbti);
  const explanation = generateEnhancedExplanation(heritage, mbti, breakdown);
  return [explanation.mbtiFit];
}

export function generateCourse(mbti: MBTIType): {
  title: string;
  description: string;
  region: string;
  sites: Array<{ id: string; name: string; city: string; image: string; summary: string }>;
} {
  const course = generateEnhancedCourse(mbti);
  return {
    title: course.title,
    description: course.description,
    region: course.region,
    sites: course.sites,
  };
}

export function debugRecommendations(mbti: MBTIType, region: Region = 'all'): void {
  debugEnhancedRecommendations(mbti, region);
}

export function compareMBTIRecommendations(
  mbtiList: MBTIType[],
  region: Region = 'all'
): void {
  console.log('\n\n########## MBTI 추천 비교 ##########\n');
  
  for (let i = 0; i < mbtiList.length; i++) {
    for (let j = i + 1; j < mbtiList.length; j++) {
      compareEnhancedMBTI(mbtiList[i], mbtiList[j], region);
    }
  }
}

export function getHeritageById(id: string): Heritage | undefined {
  return heritageData.find((h) => h.id === id);
}

export function getAllHeritages(): Heritage[] {
  return heritageData;
}

export function getFeaturedHeritages(limit: number = 6): Heritage[] {
  return heritageData.filter((h) => h.featured).slice(0, limit);
}

export function filterByRegion(region: Region): Heritage[] {
  if (region === 'all') return heritageData;
  return heritageData.filter((h) => h.region === region);
}

export function calculateMBTIScores(
  responses: Array<{ questionId: number; scores?: Partial<MBTIScores> }>
): MBTIScores {
  const scores: MBTIScores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
  
  responses.forEach((response) => {
    if (response.scores) {
      Object.entries(response.scores).forEach(([key, value]) => {
        if (key in scores && typeof value === 'number') {
          scores[key as keyof MBTIScores] += value;
        }
      });
    }
  });
  
  return scores;
}

export function determineMBTI(scores: MBTIScores): MBTIType {
  const e = scores.E >= scores.I ? 'E' : 'I';
  const s = scores.S >= scores.N ? 'S' : 'N';
  const t = scores.T >= scores.F ? 'T' : 'F';
  const j = scores.J >= scores.P ? 'J' : 'P';
  return `${e}${s}${t}${j}` as MBTIType;
}

// Export both new and legacy names
export { ENHANCED_MBTI_PROFILES as MBTI_PROFILES };

export default {
  getEnhancedRecommendations,
  generateEnhancedCourse,
  debugEnhancedRecommendations,
  compareEnhancedMBTI,
  validateAxisSeparation,
  validateStrictCriteria,
  ENHANCED_MBTI_PROFILES,
  calculateEnhancedMatchScore,
  generateEnhancedExplanation,
  // Legacy exports
  getRecommendations,
  generateCourse,
  calculateMatchScore,
};
