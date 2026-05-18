import { getRecommendations, compareMBTIRecommendations, MBTI_PROFILES } from './lib/recommendation';
import { MBTIType } from './lib/types';

console.log('========== MBTI 추천 시스템 검증 테스트 ==========\n');

// 1. INFP 결과
console.log('=== INFP (몽상가) 프로필 ===');
console.log('Primary:', MBTI_PROFILES['INFP'].primary);
console.log('Avoid:', MBTI_PROFILES['INFP'].avoid);
console.log('');

console.log('INFP 추천 결과:');
const infp = getRecommendations('INFP', 'all', 5);
infp.forEach((r, i) => {
  console.log(`${i + 1}. ${r.name} (${r.matchScore}점)`);
  console.log(`   태그: ${r.tags.join(', ')}`);
  console.log(`   점수: 조용=${r.quietScore}, 감성=${r.emotionalScore}, 자연=${r.natureScore}, 자유=${r.freeExploreScore}`);
  console.log(`   이유: ${r.matchReasons.join(' / ')}`);
});

console.log('\n');

// 2. ESTJ 결과
console.log('=== ESTJ (관리자) 프로필 ===');
console.log('Primary:', MBTI_PROFILES['ESTJ'].primary);
console.log('Avoid:', MBTI_PROFILES['ESTJ'].avoid);
console.log('');

console.log('ESTJ 추천 결과:');
const estj = getRecommendations('ESTJ', 'all', 5);
estj.forEach((r, i) => {
  console.log(`${i + 1}. ${r.name} (${r.matchScore}점)`);
  console.log(`   태그: ${r.tags.join(', ')}`);
  console.log(`   점수: 인기=${r.popularityScore}, 정돈=${r.structuredCourseScore}, 역사=${r.historyScore}`);
  console.log(`   이유: ${r.matchReasons.join(' / ')}`);
});

console.log('\n');

// 3. ISFP 결과
console.log('=== ISFP (예술가) 프로필 ===');
console.log('Primary:', MBTI_PROFILES['ISFP'].primary);
console.log('');

console.log('ISFP 추천 결과:');
const isfp = getRecommendations('ISFP', 'all', 5);
isfp.forEach((r, i) => {
  console.log(`${i + 1}. ${r.name} (${r.matchScore}점)`);
  console.log(`   태그: ${r.tags.join(', ')}`);
});

console.log('\n');

// 4. ENTJ 결과
console.log('=== ENTJ (통솔자) 프로필 ===');
console.log('Primary:', MBTI_PROFILES['ENTJ'].primary);
console.log('');

console.log('ENTJ 추천 결과:');
const entj = getRecommendations('ENTJ', 'all', 5);
entj.forEach((r, i) => {
  console.log(`${i + 1}. ${r.name} (${r.matchScore}점)`);
  console.log(`   태그: ${r.tags.join(', ')}`);
});

console.log('\n========== 중복 분석 ==========\n');

// 중복 확인
const infpNames = infp.map(r => r.name);
const estjNames = estj.map(r => r.name);
const isfpNames = isfp.map(r => r.name);
const entjNames = entj.map(r => r.name);

const infpVsEstj = infpNames.filter(name => estjNames.includes(name));
const infpVsIsfp = infpNames.filter(name => isfpNames.includes(name));
const estjVsEntj = estjNames.filter(name => entjNames.includes(name));
const infpVsEntj = infpNames.filter(name => entjNames.includes(name));

console.log(`INFP vs ESTJ 중복: ${infpVsEstj.length}개 ${infpVsEstj.length > 0 ? '(' + infpVsEstj.join(', ') + ')' : ''}`);
console.log(`INFP vs ISFP 중복: ${infpVsIsfp.length}개 ${infpVsIsfp.length > 0 ? '(' + infpVsIsfp.join(', ') + ')' : ''}`);
console.log(`ESTJ vs ENTJ 중복: ${estjVsEntj.length}개 ${estjVsEntj.length > 0 ? '(' + estjVsEntj.join(', ') + ')' : ''}`);
console.log(`INFP vs ENTJ 중복: ${infpVsEntj.length}개 ${infpVsEntj.length > 0 ? '(' + infpVsEntj.join(', ') + ')' : ''}`);

console.log('\n========== Acceptance Criteria 검증 ==========\n');

// AC 검증
const criteria1 = infpNames.filter(n => estjNames.includes(n)).length <= 2; // INFP vs ESTJ: 3개 이하 중복
const criteria2 = infpNames.filter(n => entjNames.includes(n)).length <= 2; // INFP vs ENTJ: 3개 이하 중복
const criteria3 = isfpNames.filter(n => entjNames.includes(n)).length <= 2; // ISFP vs ENTJ: 3개 이하 중복

console.log(`✓ INFP vs ESTJ 중복 2개 이하: ${criteria1 ? 'PASS' : 'FAIL'} (${infpNames.filter(n => estjNames.includes(n)).length}개)`);
console.log(`✓ INFP vs ENTJ 중복 2개 이하: ${criteria2 ? 'PASS' : 'FAIL'} (${infpNames.filter(n => entjNames.includes(n)).length}개)`);
console.log(`✓ ISFP vs ENTJ 중복 2개 이하: ${criteria3 ? 'PASS' : 'FAIL'} (${isfpNames.filter(n => entjNames.includes(n)).length}개)`);

// I 계열 vs E 계열 평균 quietScore 비교
const iTypes: MBTIType[] = ['INFP', 'ISFP', 'INFJ', 'ISFJ', 'INTJ', 'ISTJ', 'INTP', 'ISTP'];
const eTypes: MBTIType[] = ['ENFP', 'ESFP', 'ENFJ', 'ESFJ', 'ENTJ', 'ESTJ', 'ENTP', 'ESTP'];

let iQuietSum = 0;
iTypes.forEach(mbti => {
  const recs = getRecommendations(mbti, 'all', 3);
  iQuietSum += recs.reduce((sum, r) => sum + r.quietScore, 0) / recs.length;
});

let eQuietSum = 0;
eTypes.forEach(mbti => {
  const recs = getRecommendations(mbti, 'all', 3);
  eQuietSum += recs.reduce((sum, r) => sum + r.quietScore, 0) / recs.length;
});

const avgIQuiet = iQuietSum / iTypes.length;
const avgEQuiet = eQuietSum / eTypes.length;

console.log(`✓ I계열 평균 조용함 점수 > E계열: ${avgIQuiet > avgEQuiet ? 'PASS' : 'FAIL'} (I: ${avgIQuiet.toFixed(1)}, E: ${avgEQuiet.toFixed(1)})`);

console.log('\n==============================================\n');
