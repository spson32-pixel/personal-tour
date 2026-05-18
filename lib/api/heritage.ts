/**
 * 문화재청(국가유산청) Open API 연동
 * 
 * API 문서: https://www.khs.go.kr/html/HtmlPage.do?pg=/publicinfo/pbinfo3_0202.jsp
 * 
 * 주의: 실제 사용하려면 www.data.go.kr에서 인증키를 발급받아야 합니다.
 * 샘플 키는 제한된 데이터만 제공합니다.
 */

import { Heritage, Region } from '@/lib/types';

// API 설정
const API_BASE = 'http://www.khs.go.kr/cha';
const SAMPLE_KEY = 'sample'; // 실제 사용 시 data.go.kr에서 발급받은 키로 교체

// 시도 코드 매핑
const CITY_CODES: Record<string, string> = {
  'seoul': '11',      // 서울
  'busan': '21',      // 부산
  'daegu': '22',      // 대구
  'incheon': '23',    // 인천
  'gwangju': '24',    // 광주
  'daejeon': '25',    // 대전
  'ulsan': '26',      // 울산
  'sejong': '45',     // 세종
  'gyeonggi': '31',   // 경기
  'gangwon': '32',    // 강원
  'chungbuk': '33',   // 충북
  'chungnam': '34',   // 충남
  'jeonbuk': '35',    // 전북
  'jeonnam': '36',    // 전남
  'gyeongbuk': '37',  // 경북
  'gyeongnam': '38',  // 경남
  'jeju': '50',       // 제주
};

// 종목 코드
const KIND_CODES = {
  NATIONAL_TREASURE: '11',    // 국보
  TREASURE: '12',             // 복물
  HISTORIC_SITE: '13',        // 사적
  SCENIC: '15',               // 명승
  NATURAL_MONUMENT: '16',     // 천연기념물
  INTANGIBLE_HERITAGE: '17',  // 국가무형유산
  FOLK_HERITAGE: '18',        // 국가민속문화유산
};

// API 응답 타입
interface HeritageApiItem {
  sn: string;
  no: string;
  ccmaName: string;
  ccbaMnm1: string;
  ccbaMnm2: string;
  ccbaCtcdNm: string;
  ccsiName: string;
  ccbaAdmin: string;
  ccbaKdcd: string;
  ccbaAsno: string;
  ccbaCtcd: string;
  ccbaCncl: string;
  ccbaCpno: string;
  longitude: string;
  latitude: string;
  gcodeName: string;
}

interface HeritageApiResponse {
  totalCnt: string;
  item?: HeritageApiItem[] | HeritageApiItem;
}

/**
 * XML을 JSON으로 변환 (간단한 파서)
 */
function xmlToJson(xml: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');
  
  function parseNode(node: Element): any {
    if (node.children.length === 0) {
      return node.textContent || '';
    }
    
    const obj: any = {};
    for (const child of Array.from(node.children)) {
      if (obj[child.nodeName]) {
        if (!Array.isArray(obj[child.nodeName])) {
          obj[child.nodeName] = [obj[child.nodeName]];
        }
        obj[child.nodeName].push(parseNode(child));
      } else {
        obj[child.nodeName] = parseNode(child);
      }
    }
    return obj;
  }
  
  return parseNode(xmlDoc.documentElement);
}

/**
 * 문화재청 API에서 문화유산 목록 가져오기
 */
export async function fetchHeritageList(
  cityCode?: string,
  kindCode?: string,
  page: number = 1,
  pageSize: number = 100
): Promise<HeritageApiResponse> {
  const params = new URLSearchParams({
    apiKey: SAMPLE_KEY,
    pageUnit: pageSize.toString(),
    pageIndex: page.toString(),
  });

  if (cityCode) params.append('ccbaCtcd', cityCode);
  if (kindCode) params.append('ccbaKdcd', kindCode);

  try {
    const response = await fetch(`${API_BASE}/SearchKindOpenapiList.do?${params.toString()}`, {
      headers: {
        'Accept': 'application/xml',
      },
    });
    
    if (!response.ok) throw new Error('API 호출 실패');
    
    const xmlText = await response.text();
    const jsonData = xmlToJson(xmlText);
    
    return jsonData.result || { totalCnt: '0', item: [] };
  } catch (error) {
    console.error('문화재청 API 호출 오류:', error);
    throw error;
  }
}

/**
 * API 응답을 Heritage 타입으로 변환
 */
function convertApiToHeritage(apiData: HeritageApiItem): Heritage {
  const tags = [apiData.ccmaName];
  
  const regionMap: Record<string, Region> = {
    '11': 'seoul', '21': 'gyeongsang', '22': 'gyeongsang', '23': 'gyeonggi',
    '24': 'jeolla', '25': 'chungcheong', '26': 'gyeongsang', '45': 'chungcheong',
    '31': 'gyeonggi', '32': 'gangwon', '33': 'chungcheong', '34': 'chungcheong',
    '35': 'jeolla', '36': 'jeolla', '37': 'gyeongsang', '38': 'gyeongsang', '50': 'jeju',
  };

  const scores = calculateScores(apiData.ccmaName);

  return {
    id: `${apiData.ccbaKdcd}-${apiData.ccbaCtcd}-${apiData.ccbaAsno}`,
    name: apiData.ccbaMnm1,
    region: regionMap[apiData.ccbaCtcd] || 'seoul',
    city: `${apiData.ccbaCtcdNm} ${apiData.ccsiName || ''}`.trim(),
    summary: `${apiData.ccmaName}으로 지정된 국가유산입니다.`,
    historicalDescription: '상세 정보를 불러오는 중...',
    emotionalDescription: '상세 정보를 불러오는 중...',
    tags,
    ...scores,
    bestTime: '연중 개방 (휴일 확인 필요)',
    nearbySites: [],
    image: '',
    featured: apiData.ccmaName === '국보' || apiData.ccmaName === '볼',
  };
}

/**
 * 종목별 점수 자동 계산
 */
function calculateScores(kindName: string) {
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
    case '볼':
      return {
        ...baseScores,
        popularityScore: 80,
        historyScore: 95,
        analysisScore: 80,
        emotionalScore: 70,
      };
    case '사적':
      return {
        ...baseScores,
        historyScore: 90,
        quietScore: 70,
        analysisScore: 75,
      };
    case '명승':
    case '천연기념물':
      return {
        ...baseScores,
        natureScore: 95,
        emotionalScore: 85,
        quietScore: 80,
        freeExploreScore: 80,
      };
    default:
      return baseScores;
  }
}

/**
 * 전체 문화유산 데이터 가져오기
 */
export async function getAllHeritageFromApi(
  maxItems: number = 500
): Promise<Heritage[]> {
  const allHeritages: Heritage[] = [];
  let page = 1;
  
  while (allHeritages.length < maxItems) {
    try {
      const response = await fetchHeritageList(undefined, undefined, page, 100);
      
      if (!response.item) break;
      
      const items = Array.isArray(response.item) ? response.item : [response.item];
      const converted = items.map(convertApiToHeritage);
      allHeritages.push(...converted);
      
      if (items.length < 100) break;
      page++;
      
      // API 호출 간격
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('데이터 가져오기 중 오류:', error);
      break;
    }
  }
  
  return allHeritages.slice(0, maxItems);
}

export { CITY_CODES, KIND_CODES };
