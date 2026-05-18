import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'http://www.khs.go.kr/cha';

/**
 * XML을 JSON으로 변환
 */
function xmlToJson(xml: string): any {
  const result: any = {};
  
  // totalCnt 추출
  const totalMatch = xml.match(/<totalCnt>(\d+)<\/totalCnt>/);
  if (totalMatch) result.totalCnt = totalMatch[1];
  
  // item 추출
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const item: any = {};
    
    const fields = [
      'sn', 'no', 'ccmaName', 'ccbaMnm1', 'ccbaMnm2', 'ccbaCtcdNm',
      'ccsiName', 'ccbaAdmin', 'ccbaKdcd', 'ccbaAsno', 'ccbaCtcd',
      'ccbaCncl', 'ccbaCpno', 'longitude', 'latitude', 'gcodeName'
    ];
    
    fields.forEach(field => {
      const fieldMatch = itemXml.match(new RegExp(`<${field}>([^<]*)<\/${field}>`));
      item[field] = fieldMatch ? fieldMatch[1] : '';
    });
    
    items.push(item);
  }
  
  if (items.length > 0) {
    result.item = items;
  }
  
  return result;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const apiKey = searchParams.get('apiKey') || 'sample';
  const pageUnit = searchParams.get('pageUnit') || '100';
  const pageIndex = searchParams.get('pageIndex') || '1';
  const ccbaCtcd = searchParams.get('ccbaCtcd');
  const ccbaKdcd = searchParams.get('ccbaKdcd');

  const params = new URLSearchParams({
    apiKey,
    pageUnit,
    pageIndex,
  });

  if (ccbaCtcd) params.append('ccbaCtcd', ccbaCtcd);
  if (ccbaKdcd) params.append('ccbaKdcd', ccbaKdcd);

  try {
    const response = await fetch(`${API_BASE}/SearchKindOpenapiList.do?${params.toString()}`, {
      headers: {
        'Accept': 'application/xml',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const xmlText = await response.text();
    const jsonData = xmlToJson(xmlText);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('문화재청 API 오류:', error);
    
    return NextResponse.json({
      totalCnt: '0',
      item: [],
      error: 'API 호출 중 오류가 발생했습니다.',
    }, { status: 200 });
  }
}
