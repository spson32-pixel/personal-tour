import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MBTIType, Heritage } from '@/lib/types';

// OpenAI 클라이언트 초기화 (API 키 없이도 초기화 가능)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * MBTI 기반 페르소나 생성 API
 * * 요청: { mbti: MBTIType, topHeritages: Heritage[] }
 * 응답: { personaTitle, personaSummary, explorationStyle, recommendationTone }
 */
export async function POST(request: NextRequest) {
  let locale = 'ko';
  let mbti: MBTIType | undefined; // ★ 해결책: mbti를 try 밖으로 구출해서 어디서든 읽을 수 있게 만들었습니다!

  try {
    const body = await request.json();
    const { mbti: incomingMbti, topHeritages, locale: bodyLocale = 'ko' } = body as {
      mbti: MBTIType;
      topHeritages: Heritage[];
      locale?: string;
    };
    mbti = incomingMbti;
    locale = bodyLocale;

    if (!mbti || !topHeritages || topHeritages.length === 0) {
      return NextResponse.json(
        { error: 'MBTI 타입과 문화유산 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API 키가 설정되지 않았습니다. 기본 응답을 반환합니다.');
      return NextResponse.json(getDefaultPersona(mbti, locale));
    }

    // 문화유산 정보 요약
    const heritageInfo = topHeritages.map(h => ({
      name: h.name,
      region: h.city,
      tags: h.tags.slice(0, 3),
      summary: h.summary
    }));

    // OpenAI 프롬프트 구성 (locale에 따라 언어 분기)
    const isChinese = locale === 'zh';
    const isEnglish = locale === 'en';
    const prompt = isChinese ? `
원본 중국어 프롬프트 생략 (기존 코드와 동일)
` : isEnglish ? `
원본 영어 프롬프트 생략 (기존 코드와 동일)
` : `
당신은 문화유산 큐레이션 전문가입니다.
사용자의 MBTI 성향과 추천된 문화유산을 기반으로, 개인화된 탐방 페르소나를 생성해주세요.

[사용자 정보]
- MBTI: ${mbti}

[추천된 문화유산]
${heritageInfo.map((h, i) => `${i + 1}. ${h.name} (${h.region})
   - 특징: ${h.tags.join(', ')}
   - 설명: ${h.summary}`).join('\n\n')}

[출력 요구사항]
다음 JSON 형식으로 응답해주세요. 모든 값은 한국어로 작성:

{
  "personaTitle": "10자 이내의 창의적인 탐방가 타입명 (예: '감성적 역사 산책가', '분석형 문화 탐구자')",
  "personaSummary": "150자 이내의 성향 요약 - 이 MBTI 타입이 문화유산을 바라보는 특징적 관점",
  "explorationStyle": "200자 이내의 탐방 스타일 설명 - 이 성향의 사람이 선호하는 탐방 방식과 주의할 점",
  "recommendationTone": "150자 이내 - 이 유형에게 문화유산을 추천하는 메시지 톤과 접근법"
}

[중요 지침]
1. MBTI 차원(E/I, N/S, T/F, J/P)을 반영한 정확한 성향 분석
2. 추천된 문화유산의 특징(자연, 역사, 건축 등)과 연결
3. 실용적이고 구체적인 조언 포함
4. 따뜻하고 공감 어린 톤 유지
`;

    // OpenAI API 호출
    const completion = await openai!.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: isChinese
            ? '你是一位文化遗产策展专家。你根据MBTI性格类型提供个性化的旅行地推荐和游览指南。所有回复必须使用简体中文。'
            : isEnglish
            ? 'You are an expert cultural heritage curator. You provide personalized heritage recommendations and touring guides based on MBTI personality types.'
            : '당신은 문화유산 큐레이션 전문가입니다. MBTI 성향에 기반한 개인화된 문화유산 추천과 탐방 가이드를 제공합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenAI 응답이 비어있습니다.');
    }

    // JSON 파싱
    const persona = JSON.parse(content);
    
    // 응답 검증
    if (!persona.personaTitle || !persona.personaSummary) {
      throw new Error('OpenAI 응답 형식이 올바르지 않습니다.');
    }

    return NextResponse.json(persona);

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    
    // 오류 발생 시 안전하게 대피용 데이터 반환 (mbti가 없으면 기본값 INTJ 처리)
    return NextResponse.json(getDefaultPersona(mbti || ('INTJ' as MBTIType), locale));
  }
}

/**
 * 기본 페르소나 생성 (OpenAI 오류 시 폭백)
 */
function getDefaultPersona(mbti: MBTIType, locale: string = 'ko') {
  if (locale === 'zh') {
    const zhDefaults: Record<string, { personaTitle: string; personaSummary: string; explorationStyle: string; recommendationTone: string; }> = {
      'INTJ': { personaTitle: '战略型空间分析家', personaSummary: '探索前空间 구조 가치 분석...', explorationStyle: '전문 해설 활용...', recommendationTone: '역사 맥락 중심...' },
      'INTP': { personaTitle: '好奇知识探索者', personaSummary: '자유로운 탐구...', explorationStyle: '의문 해결...', recommendationTone: '논리 기반...' },
      'ENTJ': { personaTitle: '有远见的探索领导者', personaSummary: '전략적 가치 중시...', explorationStyle: '독립적 탐험...', recommendationTone: '영향력 중심...' },
      'ENTP': { personaTitle: '创意空间解解读', personaSummary: '새로운 시각...', explorationStyle: '우연한 발견...', recommendationTone: '호기심 자극...' },
      'INFJ': { personaTitle: '深度洞察的沉思探索者', personaSummary: '깊은 감동...', explorationStyle: '조용한 사색...', recommendationTone: '공감 어린...' },
      'INFP': { personaTitle: '梦幻空间幻想家', personaSummary: '시적 감성...', explorationStyle: '기록하기...', recommendationTone: '상상력 자극...' },
      'ENFJ': { personaTitle: '传递灵感的探索讲述者', personaSummary: '스토리텔러...', explorationStyle: '함께 나누기...', recommendationTone: '공동체 가치...' },
      'ENFP': { personaTitle: '自由的空间发现者', personaSummary: '에너지 분출...', explorationStyle: '즉興적 발견...', recommendationTone: '설렘 유발...' },
      'ISTJ': { personaTitle: '严谨的记录探索者', personaSummary: '체계적 조사...', explorationStyle: '안내판 정독...', recommendationTone: '정확한 사실...' },
      'ISFJ': { personaTitle: '细腻的空间守护者', personaSummary: '전통 존중...', explorationStyle: '느린 걸음...', recommendationTone: '정성 어린...' },
      'ESTJ': { personaTitle: '高效路线达人', personaSummary: '동선 최적화...', explorationStyle: '지도 활용...', recommendationTone: '최대 효율...' },
      'ESFJ': { personaTitle: '温暖的空间分享者', personaSummary: '추억 공유...', explorationStyle: '사진 남기기...', recommendationTone: '따뜻한 추천...' },
      'ISTP': { personaTitle: '洞悉结构的实战探索者', personaSummary: '원리 파악...', explorationStyle: '직접 만지기...', recommendationTone: '구조 특징...' },
      'ISFP': { personaTitle: '捕捉感性瞬间的艺术家', personaSummary: '미적 감상...', explorationStyle: '카메라 지참...', recommendationTone: '풍성한 감성...' },
      'ESTP': { personaTitle: '活跃的空间冒险家', personaSummary: '활동적 모험...', explorationStyle: '야외 활동...', recommendationTone: '에너지 유발...' },
      'ESFP': { personaTitle: '热情闪耀的探索达人', personaSummary: '축제 분위기...', explorationStyle: '공연 관람...', recommendationTone: '생동감 중심...' }
    };
    return zhDefaults[mbti] || { personaTitle: '空间探索者', personaSummary: '자신만의 스타일로 탐구.', explorationStyle: '편한 속도로 둘러보기.', recommendationTone: '다양한 매력 소개.' };
  }

  if (locale === 'en') {
    const enDefaults: Record<string, { personaTitle: string; personaSummary: string; explorationStyle: string; recommendationTone: string; }> = {
      'INTJ': { personaTitle: 'Strategic Destination Analyst', personaSummary: 'You systematically gather...', explorationStyle: 'Thorough prior research...', recommendationTone: 'Logical case...' },
      'INTP': { personaTitle: 'Curious Knowledge Explorer', personaSummary: 'Your curiosity drives you...', explorationStyle: 'Ample unstructured time...', recommendationTone: 'Facts and logic...' },
      'ENTJ': { personaTitle: 'Visionary Exploration Leader', personaSummary: 'You value strategic significance...', explorationStyle: 'Set clear goals...', recommendationTone: 'Influence and relevance...' },
      'ENTP': { personaTitle: 'Creative Space Interpreter', personaSummary: 'You reinterpret destinations...', explorationStyle: 'Serendipitous finds...', recommendationTone: 'Unconventional angles...' },
      'INFJ': { personaTitle: 'Deep-Insight Contemplative', personaSummary: 'You deeply feel stories...', explorationStyle: 'Linger at your own pace...', recommendationTone: 'Emotional resonance...' },
      'INFP': { personaTitle: 'Dreamy Space Imaginer', personaSummary: 'You immerse deeply...', explorationStyle: 'Follow your heart...', recommendationTone: 'Poetic language...' },
      'ENFJ': { personaTitle: 'Inspiring Storyteller', personaSummary: 'Shared community experiences...', explorationStyle: 'Visit with friends...', recommendationTone: 'Human connection...' },
      'ENFP': { personaTitle: 'Free-Spirited Discoverer', personaSummary: 'Boundless enthusiasm...', explorationStyle: 'Dip lightly into spaces...', recommendationTone: 'Exciting possibilities...' },
      'ISTJ': { personaTitle: 'Meticulous Record-Keeper', personaSummary: 'Systematically investigate...', explorationStyle: 'Thorough preparation...', recommendationTone: 'Precise facts...' },
      'ISFJ': { personaTitle: 'Gentle Space Guardian', personaSummary: 'Subtle details matter...', explorationStyle: 'Slow down and watch...', recommendationTone: 'Traditional values...' },
      'ESTJ': { personaTitle: 'Efficient Course Master', personaSummary: 'Systematically tour...', explorationStyle: 'Plan your route...', recommendationTone: 'Practical info...' },
      'ESFJ': { personaTitle: 'Warm Space Sharer', personaSummary: 'Cherish shared experiences...', explorationStyle: 'Follow recommended itinerary...', recommendationTone: 'Communal moments...' },
      'ISTP': { personaTitle: 'Hands-On Structure Explorer', personaSummary: 'Grasp mechanics...', explorationStyle: 'Touch and examine...', recommendationTone: 'Tactile elements...' },
      'ISFP': { personaTitle: 'Soulful Moment Capturer', personaSummary: 'Aesthetic beauty...', explorationStyle: 'Bring your camera...', recommendationTone: 'Rich sensory experience...' },
      'ESTP': { personaTitle: 'Active Space Adventurer', personaSummary: 'Swiftly move...', explorationStyle: 'Cover ground...', recommendationTone: 'Energetic itinerary...' },
      'ESFP': { personaTitle: 'Passionate Enthusiast', personaSummary: 'Vibrant elements...', explorationStyle: 'Lively atmosphere...', recommendationTone: 'High-energy...' }
    };
    return enDefaults[mbti] || { personaTitle: 'Destination Explorer', personaSummary: 'A traveler with unique style.', explorationStyle: 'Explore at your own pace.', recommendationTone: 'Various perspectives.' };
  }

  const defaults: Record<string, { personaTitle: string; personaSummary: string; explorationStyle: string; recommendationTone: string; }> = {
    'INTJ': { personaTitle: '전략적 공간 분석가', personaSummary: '탐험 전 방대한 배경 지식을 체계적으로 수집하고 맥락을 분석합니다.', explorationStyle: '방문 전 철저한 조사를 마치고 핵심 포인트만 압축해 효율적으로 탐험하세요.', recommendationTone: '역사적 맥락과 건축적 가치를 논리적으로 풀어드립니다.' },
    'INTP': { personaTitle: '호기심의 지식 탐험가', personaSummary: '공간의 원리와 구조에 대한 끝없는 호기심으로 해석을 만들어냅니다.', explorationStyle: '일정에 얽매이지 말고 자유롭게 탐험하며 원리를 파고드세요.', recommendationTone: '사실과 논리를 기반으로