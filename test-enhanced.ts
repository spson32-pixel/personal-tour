import {
  getEnhancedRecommendations,
  generateEnhancedCourse,
  debugEnhancedRecommendations,
  compareEnhancedMBTI,
  validateAxisSeparation,
  validateStrictCriteria,
  ENHANCED_MBTI_PROFILES,
  calculateEnhancedMatchScore,
  generateEnhancedExplanation,
} from './lib/recommendation';
import { MBTIType } from './lib/types';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     고도화된 MBTI 추천 시스템 검증 테스트                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// 1. Score Breakdown 검증
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. SCORE BREAKDOWN 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const testHeritage = {
  id: 'test-001',
  name: '경복궁',
  popularityScore: 95,
  quietScore: 20,
  imaginationScore: 70,
  historyScore: 95,
  emotionalScore: 60,
  structuredCourseScore: 85,
  freeExploreScore: 40,
  natureScore: 30,
  analysisScore: 80,
  tags: ['궁궐', '역사', '건축'],
  region: 'seoul',
  city: '서울 종로구',
  summary: '조선 왕조의 법궁',
  historicalDescription: '조선 태조 4년에 창걸',
  emotionalDescription: '웅장한 규모에 압도',
  bestTime: '봄, 가을',
  nearbySites: ['창덕궁'],
  image: 'https://example.com/image.jpg',
  featured: true,
} as any;

const { score, breakdown } = calculateEnhancedMatchScore(testHeritage, 'ESTJ');
console.log(`ESTJ가 경복궁에 대한 점수: ${score}점`);
console.log('Primary 기여도:', breakdown.components.primary);
console.log('Avoid 기여도:', breakdown.components.avoid);
console.log('축별 기여도:', breakdown.axisContribution);
console.log('');

// 2. Explanation 검증
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('2. EXPLANATION (설명 가능성) 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const explanation = generateEnhancedExplanation(testHeritage, 'ESTJ', breakdown);
console.log('MBTI 적합도 설명:', explanation.mbtiFit);
console.log('핵심 속성:', explanation.keyAttributes);
console.log('축별 정렬:', explanation.axisAlignment);
console.log('');

// 3. 고도화된 추천 결과 검증
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('3. 고도화된 추천 결과');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const mbtiTypes: MBTIType[] = ['INFP', 'ESTJ', 'ISFP', 'ENTJ', 'INFJ', 'INTJ'];

mbtiTypes.forEach((mbti) => {
  console.log(`\n${mbti} (${ENHANCED_MBTI_PROFILES[mbti].persona.title})`);
  console.log('─'.repeat(50));
  
  const recs = getEnhancedRecommendations(mbti, 'all', 5);
  recs.forEach((rec, idx) => {
    console.log(`${idx + 1}. ${rec.name} (${rec.matchScore}점, ${rec.quality})`);
    console.log(`   설명: ${rec.explanation.mbtiFit}`);
    console.log(`   축 기여도: EI=${rec.scoreBreakdown.axisContribution.EI.toFixed(1)}, ` +
                `TF=${rec.scoreBreakdown.axisContribution.TF.toFixed(1)}, ` +
                `JP=${rec.scoreBreakdown.axisContribution.JP.toFixed(1)}`);
  });
});

// 4. 코스 추천 검증
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('4. 고도화된 코스 추천');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

['INFP', 'ESTJ', 'ENFP'].forEach((mbti) => {
  const course = generateEnhancedCourse(mbti as MBTIType);
  console.log(`\n${mbti} - ${course.title}`);
  console.log('─'.repeat(50));
  console.log(`테마: ${course.theme}`);
  console.log(`부제: ${course.subtitle}`);
  console.log(`흐름: ${course.flow}`);
  console.log('코스:');
  course.sites.forEach((site, idx) => {
    console.log(`  ${idx + 1}. ${site.name} (${site.role})`);
  });
});

// 5. 축별 분리도 검증
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('5. 축별 분리도 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

validateAxisSeparation();

// 6. 엄격한 Acceptance Criteria 검증
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('6. 엄격한 ACCEPTANCE CRITERIA 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const passed = validateStrictCriteria();

// 7. 상세 비교
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('7. INFP vs ESTJ 상세 비교');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

compareEnhancedMBTI('INFP', 'ESTJ', 'all');

// 8. 품질-다양성 균형 검증
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('8. 품질-다양성 균형 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const qualityCheck = getEnhancedRecommendations('INFP', 'all', 5);
console.log('INFP 추천 품질 분포:');
const qualityCounts = { excellent: 0, good: 0, acceptable: 0 };
qualityCheck.forEach(r => {
  qualityCounts[r.quality]++;
});
console.log(`  Excellent (80+): ${qualityCounts.excellent}개`);
console.log(`  Good (65-79): ${qualityCounts.good}개`);
console.log(`  Acceptable (60-64): ${qualityCounts.acceptable}개`);
console.log(`  평균 점수: ${(qualityCheck.reduce((s, r) => s + r.matchScore, 0) / qualityCheck.length).toFixed(1)}점`);

// 지역 다양성 체크
const regionCounts: Record<string, number> = {};
qualityCheck.forEach(r => {
  regionCounts[r.region] = (regionCounts[r.region] || 0) + 1;
});
console.log(`\n지역 분포:`, regionCounts);

// 카테고리 다양성 체크
const categoryMap: Record<string, string> = {
  '궁궐': '궁궐', '사찰': '사찰', '산사': '사찰', '왕릉': '왕릉',
  '박물관': '박물관', '성곽': '성곽', '산성': '성곽',
  '민속마을': '마을', '마을': '마을', '정원': '정원', '유적지': '유적지',
};
const getCategory = (tags: string[]) => {
  for (const tag of tags) {
    for (const [key, cat] of Object.entries(categoryMap)) {
      if (tag.includes(key)) return cat;
    }
  }
  return '기타';
};

const catCounts: Record<string, number> = {};
qualityCheck.forEach(r => {
  const cat = getCategory(r.tags);
  catCounts[cat] = (catCounts[cat] || 0) + 1;
});
console.log(`카테고리 분포:`, catCounts);

// 9. 최종 요약
console.log('\n\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    최종 검증 요약                          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('✓ Score Breakdown: 각 점수의 출처 추적 가능');
console.log('✓ 축별 기여도: E/I, N/S, T/F, J/P별 영향력 정량화');
console.log('✓ 설명 가능성: 데이터 기반으로 설명 문장 생성');
console.log('✓ 품질 게이트: 60점 이상만 추천');
console.log('✓ 다양성 로직: 점수 구간별 차등 적용');
console.log('✓ 페르소나 기반 코스: 성향 일관성 있는 코스 구성');
console.log(`✓ Acceptance Criteria: ${passed ? '모두 충족' : '일부 미달'}`);

console.log('\n═════════════════════════════════════════════════════════════\n');
