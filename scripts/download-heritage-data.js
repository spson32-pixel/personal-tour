/**
 * 문화재청 데이터 다운로드 및 JSON 변환 스크립트
 * 
 * 사용법:
 * 1. https://www.data.go.kr/data/3070426/fileData.do 에서 CSV 다운로드
 * 2. 다운로드 받은 CSV 파일을 scripts/ 폴터에 'heritage.csv'로 저장
 * 3. node scripts/download-heritage-data.js 실행
 * 4. lib/data/heritages.json 파일이 생성됨
 */

const fs = require('fs');
const path = require('path');

// CSV 파일 읽기
const csvPath = path.join(__dirname, 'heritage.csv');
const outputPath = path.join(__dirname, '..', 'lib', 'data', 'heritages.json');

// CSV 파싱 함수
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    results.push(obj);
  }
  
  return results;
}

// 문화재 종목별 점수 계산
function calculateScores(kindName) {
  const baseScores = {
    popularityScore: 50,
    quietScore: 50,
    imaginationScore: 50,
    historyScore: 70,
    analysisScore: 50,
    emotionalScore: 50,
    structuredCourseScore: 60,
    freeExploreScore: 50,
    natureScore: 30,
  };

  switch (kindName) {
    case '국보':
      return { ...baseScores, popularityScore: 85, historyScore: 98, analysisScore: 85, emotionalScore: 75 };
    case '볼':
      return { ...baseScores, popularityScore: 80, historyScore: 95, analysisScore: 80, emotionalScore: 70 };
    case '사적':
    case '사적및명승':
      return { ...baseScores, historyScore: 90, quietScore: 70, analysisScore: 75, natureScore: 60 };
    case '명승':
      return { ...baseScores, natureScore: 95, emotionalScore: 90, quietScore: 80, freeExploreScore: 85 };
    case '천연기념물':
      return { ...baseScores, natureScore: 98, emotionalScore: 85, quietScore: 85, freeExploreScore: 90 };
    case '국가무형유산':
      return { ...baseScores, imaginationScore: 85, emotionalScore: 80, popularityScore: 65 };
    case '국가민속문화유산':
      return { ...baseScores, emotionalScore: 80, popularityScore: 70, freeExploreScore: 75 };
    case '시도유형문화유산':
      return { ...baseScores, historyScore: 75, quietScore: 60 };
    case '등록유산':
      return { ...baseScores, popularityScore: 60, emotionalScore: 65 };
    default:
      return baseScores;
  }
}

// 지역 매핑
function mapRegion(cityCode) {
  const regionMap = {
    '11': 'seoul',
    '21': 'gyeongsang', '22': 'gyeongsang', '26': 'gyeongsang', '37': 'gyeongsang', '38': 'gyeongsang',
    '23': 'gyeonggi', '31': 'gyeonggi',
    '32': 'gangwon',
    '25': 'chungcheong', '33': 'chungcheong', '34': 'chungcheong', '45': 'chungcheong',
    '24': 'jeolla', '35': 'jeolla', '36': 'jeolla',
    '50': 'jeju',
  };
  return regionMap[cityCode] || 'seoul';
}

// 태그 생성
function generateTags(kindName, name, city) {
  const tags = [kindName];
  
  // 이름 기반 태그
  if (name.includes('사')) tags.push('사찰');
  if (name.includes('성') || name.includes('산성')) tags.push('성');
  if (name.includes('궁')) tags.push('궁궐');
  if (name.includes('정') || name.includes('원')) tags.push('정원');
  if (name.includes('촌') || name.includes('마을')) tags.push('마을');
  if (name.includes('묘') || name.includes('릉')) tags.push('고분');
  if (name.includes('탑')) tags.push('탑');
  
  // 지역 기반 태그
  if (city.includes('경주')) tags.push('신라');
  if (city.includes('부여') || city.includes('공주')) tags.push('백제');
  if (city.includes('서울') || city.includes('경복') || city.includes('창덕')) tags.push('조선');
  
  // 중복 제거
  return [...new Set(tags)].slice(0, 6);
}

// CSV 데이터를 Heritage 형식으로 변환
function convertToHeritageFormat(csvData) {
  return csvData.map((item, index) => {
    const scores = calculateScores(item.ccmaName || item.종목 || '기타');
    const region = mapRegion(item.ccbaCtcd || item.시도코드 || '11');
    const cityName = item.ccbaCtcdNm || item.시도명 || '서울';
    const sigungu = item.ccsiName || item.시군구명 || '';
    const name = item.ccbaMnm1 || item.문화재명 || `문화재 ${index + 1}`;
    const kind = item.ccmaName || item.종목 || '기타';
    
    const heritage = {
      id: `heritage-${index + 1}`,
      name: name,
      region: region,
      city: `${cityName} ${sigungu}`.trim(),
      summary: item.ccbaAsdt || item.지정연도 
        ? `${kind}으로 ${item.ccbaAsdt || item.지정연도}에 지정된 국가유산입니다.`
        : `${kind}으로 지정된 국가유산입니다.`,
      historicalDescription: item.content || item.설명 || `${name}은(는) ${kind}으로 지정된 문화유산입니다.`,
      emotionalDescription: ` ${name}을(를) 방문하면 ${cityName} 지역의 역사와 문화를 느낄 수 있습니다.`,
      tags: generateTags(kind, name, cityName),
      ...scores,
      bestTime: '연중 개방 (휴일 및 특별관람일 확인 필요)',
      nearbySites: [],
      image: '', // 이미지는 별도로 추가 필요
      featured: ['국보', '볼', '천연기념물', '명승'].includes(kind),
    };
    
    return heritage;
  });
}

// 메인 실행
async function main() {
  try {
    console.log('📥 문화재청 CSV 파일 읽는 중...');
    
    // CSV 파일 존재 확인
    if (!fs.existsSync(csvPath)) {
      console.error('❌ heritage.csv 파일이 없습니다!');
      console.log('\n📌 다음 단계를 따라주세요:');
      console.log('1. https://www.data.go.kr/data/3070426/fileData.do 접속');
      console.log('2. "문화재청 국가유산 정보" CSV 파일 다운로드');
      console.log('3. 다운로드 받은 파일을 scripts/heritage.csv로 저장');
      console.log('4. 이 스크립트를 다시 실행하세요\n');
      process.exit(1);
    }
    
    // CSV 읽기
    const csvText = fs.readFileSync(csvPath, 'utf8');
    console.log('✅ CSV 파일 읽기 완료');
    
    // 파싱
    console.log('🔍 CSV 파싱 중...');
    const parsedData = parseCSV(csvText);
    console.log(`✅ ${parsedData.length}개 데이터 파싱 완료`);
    
    // Heritage 형식으로 변환
    console.log('🔄 Heritage 형식으로 변환 중...');
    const heritageData = convertToHeritageFormat(parsedData);
    
    // JSON 저장
    console.log('💾 JSON 파일 저장 중...');
    fs.writeFileSync(outputPath, JSON.stringify(heritageData, null, 2), 'utf8');
    
    console.log('\n🎉 변환 완료!');
    console.log(`📁 출력 파일: ${outputPath}`);
    console.log(`📊 총 ${heritageData.length}개 문화유산 변환됨`);
    
    // 통계 출력
    const featuredCount = heritageData.filter(h => h.featured).length;
    const regionCounts = {};
    heritageData.forEach(h => {
      regionCounts[h.region] = (regionCounts[h.region] || 0) + 1;
    });
    
    console.log('\n📈 통계:');
    console.log(`  - 추천 문화유산: ${featuredCount}개`);
    console.log('  - 지역별 분포:');
    Object.entries(regionCounts).forEach(([region, count]) => {
      console.log(`    ${region}: ${count}개`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();
