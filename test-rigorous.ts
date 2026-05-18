import {
  getEnhancedRecommendations,
  generateEnhancedCourse,
  compareEnhancedMBTI,
  validateAxisSeparation,
  validateStrictCriteria,
  ENHANCED_MBTI_PROFILES,
  calculateEnhancedMatchScore,
  generateEnhancedExplanation,
} from './lib/recommendation';
import { MBTIType } from './lib/types';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           엄격한 MBTI 추천 시스템 추가 검증                     ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let totalTests = 0;
let passedTests = 0;

function test(name: string, condition: boolean): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ ${name}`);
  } else {
    console.log(`✗ ${name}`);
  }
}

// ============================================================================
// 테스트 1: 모든 MBTI 타입이 유효한 추천을 받는지
// ============================================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 1: 전체 MBTI 타입 추천 유효성');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const allTypes: MBTIType[] = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

allTypes.forEach((mbti) => {
  const recs = getEnhancedRecommendations(mbti, 'all', 5);
  const hasRecommendations = recs.length >= 3;
  const allHaveScores = recs.every(r => r.matchScore > 0);
  const allHaveBreakdown = recs.every(r => r.scoreBreakdown && r.explanation);
  
  test(`${mbti}: 최소 3개 추천`, recs.length >= 3);
  test(`${mbti}: 모든 추천에 점수 있음`, allHaveScores);
  test(`${mbti}: 모든 추천에 breakdown 있음`, allHaveBreakdown);
});

// ============================================================================
// 테스트 2: Score Breakdown 정확성 검증
// ============================================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 2: Score Breakdown 정확성');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const sampleHeritage = {
  id: 'test-001',
  name: '테스트 유산',
  popularityScore: 80,
  quietScore: 60,
  imaginationScore: 70,
  historyScore: 90,
  emotionalScore: 75,
  structuredCourseScore: 85,
  freeExploreScore: 50,
  natureScore: 65,
  analysisScore: 80,
  tags: ['궁궐', '역사'],
  region: 'seoul',
  city: '서울',
  summary: '테스트',
  historicalDescription: '테스트',
  emotionalDescription: '테스트',
  bestTime: '봄',
  nearbySites: [],
  image: '',
  featured: true,
} as any;

// ESTJ 프로필로 테스트 (Primary: structured, popularity, history)
const { score, breakdown } = calculateEnhancedMatchScore(sampleHeritage, 'ESTJ');

// Primary 기여도 계산 검증 (가중치 5)
const expectedPrimarySum = (85 + 80 + 90) * 5; // structured + popularity + history
const actualPrimarySum = breakdown.components.primary.reduce((sum, c) => sum + c.weightedScore, 0);
test('Primary 기여도 계산 정확성', expectedPrimarySum === actualPrimarySum);

// 축별 기여도 존재 확인
test('축별 기여도 EI 존재', typeof breakdown.axisContribution.EI === 'number');
test('축별 기여도 NS 존재', typeof breakdown.axisContribution.NS === 'number');
test('축별 기여도 TF 존재', typeof breakdown.axisContribution.TF === 'number');
test('축별 기여도 JP 존재', typeof breakdown.axisContribution.JP === 'number');

console.log(`\n  계산된 총점: ${score}점`);
console.log(`  Primary 기여: ${actualPrimarySum}점`);
console.log(`  축별 기여도:`, breakdown.axisContribution);

// ============================================================================
// 테스트 3: 축별 분리도 정량적 검증
// ============================================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 3: 축별 분리도 정량 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

function calcAxisStats(types: MBTIType[]) {
  const allScores = {
    quiet: [] as number[],
    history: [] as number[],
    emotional: [] as number[],
    structured: [] as number[],
    freeExplore: [] as number[],
    nature: [] as number[],
    popularity: [] as number[],
    imagination: [] as number[],
  };
  
  types.forEach(mbti => {
    const recs = getEnhancedRecommendations(mbti, 'all', 3);
    recs.forEach(r => {
      allScores.quiet.push(r.quietScore);
      allScores.history.push(r.historyScore);
      allScores.emotional.push(r.emotionalScore);
      allScores.structured.push(r.structuredCourseScore);
      allScores.freeExplore.push(r.freeExploreScore);
      allScores.nature.push(r.natureScore);
      allScores.popularity.push(r.popularityScore);
      allScores.imagination.push(r.imaginationScore);
    });
  });
  
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    quiet: avg(allScores.quiet),
    history: avg(allScores.history),
    emotional: avg(allScores.emotional),
    structured: avg(allScores.structured),
    freeExplore: avg(allScores.freeExplore),
    nature: avg(allScores.nature),
    popularity: avg(allScores.popularity),
    imagination: avg(allScores.imagination),
  };
}

const iTypes: MBTIType[] = ['INFP', 'ISFP', 'INFJ', 'ISFJ', 'INTJ', 'ISTJ', 'INTP', 'ISTP'];
const eTypes: MBTIType[] = ['ENFP', 'ESFP', 'ENFJ', 'ESFJ', 'ENTJ', 'ESTJ', 'ENTP', 'ESTP'];
const jTypes: MBTIType[] = ['INTJ', 'INFJ', 'ISTJ', 'ISFJ', 'ENTJ', 'ENFJ', 'ESTJ', 'ESFJ'];
const pTypes: MBTIType[] = ['INTP', 'INFP', 'ISTP', 'ISFP', 'ENTP', 'ENFP', 'ESTP', 'ESFP'];
const tTypes: MBTIType[] = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'ISTJ', 'ISTP', 'ESTJ', 'ESTP'];
const fTypes: MBTIType[] = ['INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISFJ', 'ISFP', 'ESFJ', 'ESFP'];
const nTypes: MBTIType[] = ['INTJ', 'INFJ', 'ENTJ', 'ENFJ', 'INTP', 'INFP', 'ENTP', 'ENFP'];
const sTypes: MBTIType[] = ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

const iStats = calcAxisStats(iTypes);
const eStats = calcAxisStats(eTypes);
const jStats = calcAxisStats(jTypes);
const pStats = calcAxisStats(pTypes);
const tStats = calcAxisStats(tTypes);
const fStats = calcAxisStats(fTypes);
const nStats = calcAxisStats(nTypes);
const sStats = calcAxisStats(sTypes);

console.log('E-I 축 (조용함 기대: I > E):');
console.log(`  I 평균: ${iStats.quiet.toFixed(1)}, E 평균: ${eStats.quiet.toFixed(1)}`);
console.log(`  차이: ${(iStats.quiet - eStats.quiet).toFixed(1)}`);
test('E-I 축: I가 E보다 조용함 점수 높음', iStats.quiet > eStats.quiet);

console.log('\nJ-P 축 (정돈 기대: J > P):');
console.log(`  J 평균: ${jStats.structured.toFixed(1)}, P 평균: ${pStats.structured.toFixed(1)}`);
console.log(`  차이: ${(jStats.structured - pStats.structured).toFixed(1)}`);
test('J-P 축: J가 P보다 정돈 점수 높음', jStats.structured > pStats.structured);

console.log('\nT-F 축 (감성 기대: F > T):');
console.log(`  F 평균: ${fStats.emotional.toFixed(1)}, T 평균: ${tStats.emotional.toFixed(1)}`);
console.log(`  차이: ${(fStats.emotional - tStats.emotional).toFixed(1)}`);
test('T-F 축: F가 T보다 감성 점수 높음', fStats.emotional > tStats.emotional);

console.log('\nN-S 축 (상상력 기대: N > S):');
console.log(`  N 평균: ${nStats.imagination.toFixed(1)}, S 평균: ${sStats.imagination.toFixed(1)}`);
console.log(`  차이: ${(nStats.imagination - sStats.imagination).toFixed(1)}`);
test('N-S 축: N이 S보다 상상력 점수 높음', nStats.imagination > sStats.imagination);

// ============================================================================
// 테스트 4: 추천 중복도 검증 (모든 조합)
// ============================================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 4: 전체 MBTI 쌍 중복도 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const criticalPairs: Array<[MBTIType, MBTIType, number]> = [
  ['INFP', 'ESTJ', 1],  // 완전 반대
  ['ISFP', 'ENTJ', 1],  // 완전 반대
  ['INTJ', 'ESFP', 1],  // 완전 반대
  ['INFJ', 'ESTP', 1],  // 완전 반대
  ['INTP', 'ESFJ', 1],  // 완전 반대
  ['ISTP', 'ENFJ', 1],  // 완전 반대
  ['ISTJ', 'ENFP', 1],  // 완전 반대
  ['ISFJ', 'ENTP', 1],  // 완전 반대
  ['INFP', 'ISFP', 3],  // 유사 (둘 다 IFP)
  ['ESTJ', 'ENTJ', 3],  // 유사 (둘 다 ETJ)
  ['ENFP', 'ENFJ', 3],  // 유사 (둘 다 ENF)
];

let allOverlapPassed = true;

criticalPairs.forEach(([mbti1, mbti2, maxOverlap]) => {
  const recs1 = getEnhancedRecommendations(mbti1, 'all', 5);
  const recs2 = getEnhancedRecommendations(mbti2, 'all', 5);
  const names1 = recs1.map(r => r.name);
  const names2 = recs2.map(r => r.name);
  const overlap = names1.filter(n => names2.includes(n)).length;
  
  const passed = overlap <= maxOverlap;
  allOverlapPassed = allOverlapPassed && passed;
  
  const symbol = passed ? '✓' : '✗';
  console.log(`${symbol} ${mbti1} vs ${mbti2}: ${overlap}개 중복 (기준: ${maxOverlap}개 이하)`);
});

test('모든 중복도 기준 충족', allOverlapPassed);

// ============================================================================
// 테스트 5: 품질 등급 분포 검증
// ============================================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 5: 품질 등급 분포 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let totalExcellent = 0;
let totalGood = 0;
let totalAcceptable = 0;
let totalRecs = 0;

allTypes.forEach(mbti => {
  const recs = getEnhancedRecommendations(mbti, 'all', 5);
  recs.forEach(r => {
    totalRecs++;
    if (r.quality === 'excellent') totalExcellent++;
    else if (r.quality === 'good') totalGood++;
    else if (r.quality === 'acceptable') totalAcceptable++;
  });
});

const excellentRatio = totalExcellent / totalRecs;
const goodRatio = totalGood / totalRecs;
const acceptableRatio = totalAcceptable / totalRecs;

console.log(`총 추천 수: ${totalRecs}`);
console.log(`Excellent (80+): ${totalExcellent}개 (${(excellentRatio * 100).toFixed(1)}%)`);
console.log(`Good (65-79): ${totalGood}개 (${(goodRatio * 100).toFixed(1)}%)`);
console.log(`Acceptable (60-64): ${totalAcceptable}개 (${(acceptableRatio * 100).toFixed(1)}%)`);

test('Excellent 비율이 30% 이상', excellentRatio >= 0.30);
test('Acceptable 비율이 30% 이하', acceptableRatio <= 0.30);

// ============================================================================
// 테스트 6: 설명 문구 일관성 검증
// ============================================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 6: 설명 문구 일관성');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const testMBTIs: MBTIType[] = ['INFP', 'ESTJ', 'INTJ', 'ESFP'];

let explanationConsistent = true;

testMBTIs.forEach(mbti => {
  const recs = getEnhancedRecommendations(mbti, 'all', 3);
  recs.forEach(rec => {
    // 설명이 비어있지 않은지
    const hasExplanation = rec.explanation.mbtiFit && rec.explanation.mbtiFit.length > 10;
    // 핵심 속성이 있어야 함
    const hasKeyAttrs = rec.explanation.keyAttributes.length > 0;
    // 축별 정렬 정보가 있어야 함
    const hasAxisAlignment = rec.explanation.axisAlignment.length === 4;
    
    if (!hasExplanation || !hasKeyAttrs || !hasAxisAlignment) {
      explanationConsistent = false;
      console.log(`  ✗ ${mbti} - ${rec.name}: 설명 불완전`);
    }
  });
});

test('모든 추천에 완전한 설명 있음', explanationConsistent);

// ============================================================================
// 테스트 7: 다양성 검증 (지역/카테고리 분산)
// ============================================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 7: 다양성 (지역/카테고리 분산)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

allTypes.slice(0, 4).forEach(mbti => {
  const recs = getEnhancedRecommendations(mbti, 'all', 5);
  
  // 지역 분산
  const regions = recs.map(r => r.region);
  const uniqueRegions = new Set(regions).size;
  
  // 카테고리 분산
  const categories = recs.map(r => getCategory(r.tags));
  const uniqueCategories = new Set(categories).size;
  
  console.log(`${mbti}:`);
  console.log(`  지역 분산: ${uniqueRegions}개 지역 (${regions.join(', ')})`);
  console.log(`  카테고리 분산: ${uniqueCategories}개 (${categories.join(', ')})`);
  
  test(`${mbti}: 최소 2개 이상 지역`, uniqueRegions >= 2);
  test(`${mbti}: 최소 2개 이상 카테고리`, uniqueCategories >= 2);
});

// ============================================================================
// 테스트 8: 특정 케이스 심층 분석
// ============================================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('테스트 8: 특정 케이스 심층 분석');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('INFP vs ESTJ 상세 비교:\n');
const infpRecs = getEnhancedRecommendations('INFP', 'all', 5);
const estjRecs = getEnhancedRecommendations('ESTJ', 'all', 5);

console.log('INFP 추천 (감성/자연 중심 기대):');
infpRecs.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.name} (${r.matchScore}점)`);
  console.log(`     - natureScore: ${r.natureScore}, emotionalScore: ${r.emotionalScore}`);
  console.log(`     - popularityScore: ${r.popularityScore}, structuredCourseScore: ${r.structuredCourseScore}`);
  console.log(`     - 설명: ${r.explanation.mbtiFit.substring(0, 50)}...`);
});

console.log('\nESTJ 추천 (상징/정돈 중심 기대):');
estjRecs.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.name} (${r.matchScore}점)`);
  console.log(`     - popularityScore: ${r.popularityScore}, structuredCourseScore: ${r.structuredCourseScore}`);
  console.log(`     - natureScore: ${r.natureScore}, emotionalScore: ${r.emotionalScore}`);
  console.log(`     - 설명: ${r.explanation.mbtiFit.substring(0, 50)}...`);
});

// INFP는 자연/감성 점수가 높아야 함
const infpAvgNature = infpRecs.reduce((s, r) => s + r.natureScore, 0) / infpRecs.length;
const infpAvgEmotional = infpRecs.reduce((s, r) => s + r.emotionalScore, 0) / infpRecs.length;
const estjAvgNature = estjRecs.reduce((s, r) => s + r.natureScore, 0) / estjRecs.length;
const estjAvgEmotional = estjRecs.reduce((s, r) => s + r.emotionalScore, 0) / estjRecs.length;

console.log('\n속성 평균 비교:');
console.log(`  INFP - 자연: ${infpAvgNature.toFixed(1)}, 감성: ${infpAvgEmotional.toFixed(1)}`);
console.log(`  ESTJ - 자연: ${estjAvgNature.toFixed(1)}, 감성: ${estjAvgEmotional.toFixed(1)}`);

test('INFP가 ESTJ보다 자연 점수 높음', infpAvgNature > estjAvgNature);
test('INFP가 ESTJ보다 감성 점수 높음', infpAvgEmotional > estjAvgEmotional);

// ============================================================================
// 최종 결과
// ============================================================================
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                        최종 검증 결과                           ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log(`\n총 테스트: ${totalTests}개`);
console.log(`통과: ${passedTests}개`);
console.log(`실패: ${totalTests - passedTests}개`);
console.log(`성공률: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 모든 검증 테스트 통과!');
} else {
  console.log(`\n⚠️ ${totalTests - passedTests}개 테스트 실패 - 개선 필요`);
}

console.log('\n═══════════════════════════════════════════════════════════════════\n');
