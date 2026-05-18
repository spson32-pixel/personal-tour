import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MBTIType, Heritage } from '@/lib/types';

// OpenAI 클라이언트 초기화 (API 키 없이도 초기화 가능)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * MBTI 기반 페르소나 생성 API
 */
export async function POST(request: NextRequest) {
  let locale = 'ko';
  let mbti: MBTIType | undefined;

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
너는 문화유산 큐레이션 전문가이다.
사용자의 MBTI 성향과 추천된 문화유산을 기반으로, 개인화된 탐방 페르소나를 생성해주세요.

[사용자 정보]
- MBTI: ${mbti}

[추천된 문화유산]
${heritageInfo.map((h, i) => `${i + 1}. ${h.name} (${h.region})
   - 특징: ${h.tags.join(', ')}
   - 설명: ${h.summary}`).join('\n\n')}

[출력 요구사항]
다음 JSON 형식으로 응답해주세요. 모든 값은 중국어로 작성:

{
  "personaTitle": "创意探索者类型名称",
  "personaSummary": "150字以内的性格摘要",
  "explorationStyle": "200字以内的探索风格说明",
  "recommendationTone": "150字以内语气与方式"
}
` : isEnglish ? `
You are an expert cultural heritage curator.
Based on the user's MBTI personality and their top recommended heritage sites, generate a personalized explorer persona.

[User Info]
- MBTI: ${mbti}

[Recommended Heritage Sites]
${heritageInfo.map((h, i) => `${i + 1}. ${h.name} (${h.region})
   - Characteristics: ${h.tags.join(', ')}
   - Description: ${h.summary}`).join('\n\n')}

[Output Requirements]
Respond in the following JSON format. All values must be written in English:

{
  "personaTitle": "A creative explorer type name",
  "personaSummary": "A summary of personality traits in under 150 words",
  "explorationStyle": "Exploration style description in under 200 words",
  "recommendationTone": "Under 150 words tone and approach"
}
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
            ? '你是一位文化遗产策展专家。'
            : isEnglish
            ? 'You are an expert cultural heritage curator.'
            : '당신은 문화유산 큐레이션 전문가입니다.'
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

    const persona = JSON.parse(content);
    
    if (!persona.personaTitle || !persona.personaSummary) {
      throw new Error('OpenAI 응답 형식이 올바르지 않습니다.');
    }

    return NextResponse.json(persona);

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    return NextResponse.json(getDefaultPersona(mbti || ('INTJ' as MBTIType), locale));
  }
}

function getDefaultPersona(mbti: MBTIType, locale: string = 'ko') {
  if (locale === 'zh') {
    const zhDefaults: Record<string, { personaTitle: string; personaSummary: string; explorationStyle: string; recommendationTone: string; }> = {
      'INTJ': { personaTitle: '战略型空间分析家', personaSummary: '探索前系统收集大量背景知识，分析空间的脉络与结构价值。', explorationStyle: '充分调研后聚焦核心要点高效探索。', recommendationTone: '以逻辑方式解读历史脉络。' },
      'INTP': { personaTitle: '好奇知识探索者', personaSummary: '对空间的原理与结构充满无尽好奇。', explorationStyle: '不受行程束缚，自由探索。', recommendationTone: '以事实与逻辑为基础。' },
      'ENTJ': { personaTitle: '有远见的探索领导者', personaSummary: '重视战略价值与现代意义。', explorationStyle: '设定明确目标与动线。', recommendationTone: '结合具体战略启示提出建议。' },
      'ENTP': { personaTitle: '创意空间解读者', personaSummary: '用全新视角重新诠释旅行地。', explorationStyle: '比起固定路线，更享受意外的发现。', recommendationTone: '激发你的好奇心。' },
      'INFJ': { personaTitle: '深度洞察的沉思探索者', personaSummary: '深刻感受空间中人们的故事与意义。', explorationStyle: '避开人多的时段， enjoy quiet time.', recommendationTone: '传递能久久留在心中的共鸣。' },
      'INFP': { personaTitle: '梦幻空间幻想家', personaSummary: '深深沉浸于旅行地的感性与氛围。', explorationStyle: '不必在意动线，随心而行。', recommendationTone: '用感性而诗意的语言传递氛围。' },
      'ENFJ': { personaTitle: '传递灵感的探索讲述者', personaSummary: '通过故事与他人连结。', explorationStyle: '与 family or friends 同行。', recommendationTone: '聚焦人与人之间的连结。' },
      'ENFP': { personaTitle: '自由的空间发现者', personaSummary: '享受发现新旅行地并探索可能性。', explorationStyle: '与当地人随意交流， 즉흥적 즐거움.', recommendationTone: '不断提示有趣的可能性。' },
      'ISTJ': { personaTitle: '严谨的记录探索者', personaSummary: '系统地探究事实，重视经验。', explorationStyle: '认真阅读每一块指示牌。', recommendationTone: '以准确的历史事实为基础。' },
      'ISFJ': { personaTitle: '细腻的空间守护者', personaSummary: '静静感受空间的细腻价值。', explorationStyle: '用缓慢的步伐充分品味。', recommendationTone: '留下深刻印象的真诚推荐。' },
      'ESTJ': { personaTitle: '高效路线达人', personaSummary: '以高效规划的路线系统探访。', explorationStyle: '积极利用导览地图和语音导览。', recommendationTone: '提出时间效益最高方案。' },
      'ESFJ': { personaTitle: '温暖的空间分享者', personaSummary: '通过旅行地与他人连结。', explorationStyle: '用照片留下珍贵时刻。', recommendationTone: '推荐想要一起分享的特别旅行。' },
      'ISTP': { personaTitle: '洞悉结构的实战探索者', personaSummary: '把握空间实用功能与结构。', explorationStyle: 'Directly touch and observe.', recommendationTone: '제안을 실용적으로 전달.' },
      'ISFP': { personaTitle: '捕捉感性瞬间的艺术家', personaSummary: '细腻感受空间的美学之美。', explorationStyle: '选择自然光最美的时刻。', recommendationTone: '풍성한 감성으로 추천.' },
      'ESTP': { personaTitle: '活跃的空间冒险家', personaSummary: '快速穿梭于各旅行地之间。', explorationStyle: '户外空间或体验项目丰富的地方。', recommendationTone: '생동감 있는 탐험 제안.' },
      'ESFP': { personaTitle: '热情闪耀的探索达人', personaSummary: '享受生动魅力并分享。', explorationStyle: '寻找有演出、节庆 空间。', recommendationTone: '에너지 넘치게 추천.' }
    };
    return zhDefaults[mbti] || { personaTitle: '空间探索者', personaSummary: '探索历史与感性。', explorationStyle: '以舒适节奏游览。', recommendationTone: '介绍独特魅力。' };
  }

  if (locale === 'en') {
    const enDefaults: Record<string, { personaTitle: string; personaSummary: string; explorationStyle: string; recommendationTone: string; }> = {
      'INTJ': { personaTitle: 'Strategic Destination Analyst', personaSummary: 'You systematically gather background knowledge.', explorationStyle: 'Thorough prior research is your superpower.', recommendationTone: 'Logical architectural significance.' },
      'INTP': { personaTitle: 'Curious Knowledge Explorer', personaSummary: 'Your curiosity drives original interpretations.', explorationStyle: 'Give yourself ample unstructured time.', recommendationTone: 'Facts and logic framework.' },
      'ENTJ': { personaTitle: 'Visionary Exploration Leader', personaSummary: 'You value strategic significance.', explorationStyle: 'Set clear goals and a defined route.', recommendationTone: 'Concrete strategic takeaways.' },
      'ENTP': { personaTitle: 'Creative Space Interpreter', personaSummary: 'You reinterpret destinations.', explorationStyle: 'Serendipitous finds beat a rigid itinerary.', recommendationTone: 'Sparking curiosity with unconventional angles.' },
      'INFJ': { personaTitle: 'Deep-Insight Contemplative Explorer', personaSummary: 'You deeply feel the human stories.', explorationStyle: 'Linger at your own pace.', recommendationTone: 'Centering the emotional resonance.' },
      'INFP': { personaTitle: 'Dreamy Space Imaginer', personaSummary: 'You immerse deeply in emotion.', explorationStyle: 'Follow your heart rather than a fixed route.', recommendationTone: 'Transcend time through imagination.' },
      'ENFJ': { personaTitle: 'Inspiring Exploration Storyteller', personaSummary: 'Sharing and inspiring is your style.', explorationStyle: 'Guided programs are rewarding.', recommendationTone: 'Underscoring social connection.' },
      'ENFP': { personaTitle: 'Free-Spirited Space Discoverer', personaSummary: 'Unexpected moments shine.', explorationStyle: 'Chat with locals or join hands-on programs.', recommendationTone: 'Surfacing exciting possibilities.' },
      'ISTJ': { personaTitle: 'Meticulous Record-Keeper Explorer', personaSummary: 'Accurate, in-depth facts.', explorationStyle: 'Read every information panel carefully.', recommendationTone: 'Grounded in precise facts.' },
      'ISFJ': { personaTitle: 'Gentle Space Guardian', personaSummary: 'Quiet destinations bring peace.', explorationStyle: 'Keep your senses open to small details.', recommendationTone: 'A heartfelt recommendation.' },
      'ESTJ': { personaTitle: 'Efficient Course Master', personaSummary: 'Prioritizing practical info.', explorationStyle: 'Plan route and schedule in advance.', recommendationTone: 'High-value exploration choice.' },
      'ESFJ': { personaTitle: 'Warm Space Sharer', personaSummary: 'Cherishing shared experiences.', explorationStyle: 'Take plenty of photos.', recommendationTone: 'Warm communal moments.' },
      'ISTP': { personaTitle: 'Hands-On Structure Explorer', personaSummary: 'Understand how things work.', explorationStyle: 'Touch things and examine mechanics.', recommendationTone: 'Tactile and experiential elements.' },
      'ISFP': { personaTitle: 'Soulful Moment Capturer', personaSummary: 'Aesthetic beauty in stillness.', explorationStyle: 'Bring your camera or sketchbook.', recommendationTone: 'Rich sensory experiences.' },
      'ESTP': { personaTitle: 'Active Space Adventurer', personaSummary: 'Vibrant active engagement.', explorationStyle: 'Outdoor spaces are perfect matches.', recommendationTone: 'Energetic itinerary built for action.' },
      'ESFP': { personaTitle: 'Passionate Exploration Enthusiast', personaSummary: 'Lively welcoming atmosphere.', explorationStyle: ' Festivals or interactive programs.', recommendationTone: 'High-energy recommendations.' }
    };
    return enDefaults[mbti] || { personaTitle: 'Destination Explorer', personaSummary: 'A traveler with unique style.', explorationStyle: 'Explore at comfortable pace.', recommendationTone: 'Various perspectives.' };
  }

  const defaults: Record<string, { personaTitle: string; personaSummary: string; explorationStyle: string; recommendationTone: string; }> = {
    'INTJ': { personaTitle: '전략적 공간 분석가', personaSummary: '탐험 전 방대한 배경 지식을 체계적으로 수집하고 맥락을 분석합니다.', explorationStyle: '방문 전 철저한 조사를 마치고 핵심 포인트만 압축해 효율적으로 탐험하세요.', recommendationTone: '역사적 맥락과 건축적 가치를 논리적으로 풀어드립니다.' },
    'INTP': { personaTitle: '호기심의 지식 탐험가', personaSummary: '공간의 원리와 구조에 대한 끝없는 호기심으로 해석을 만들어냅니다.', explorationStyle: '일정에 얽매이지 말고 자유롭게 탐험하며 원리를 파고드세요.', recommendationTone: '사실과 논리를 기반으로 숨겨진 의미를 탐구하도록 돕습니다.' },
    'ENTJ': { personaTitle: '비전 있는 탐험 리더', personaSummary: '여행지의 전략적 가치와 현대적 의미를 중시합니다.', explorationStyle: '명확한 목표와 동선을 설정하고 핵심 여행지를 중심으로 파악하세요.', recommendationTone: '여행지가 지닌 영향력을 중심으로 구체적인 시사점을 제안합니다.' },
    'ENTP': { personaTitle: '창의적 공간 해석가', personaSummary: '여행지를 새로운 관점으로 재해석하며 전통과 현대의 연결고리를 탐구합니다.', explorationStyle: '정해진 코스보다 우연한 발견을 즐기고 시각을 넓히세요.', recommendationTone: '흥미로운 시각과 숨겨진 이야기로 호기심을 자극합니다.' },
    'INFJ': { personaTitle: '깊은 통찰의 사색 탐험가', personaSummary: '공간에 담긴 사람들의 이야기와 의미를 깊이 있게 느낍니다.', explorationStyle: '서두르지 말고 여유롭게 공간을 느끼며 사색 시간을 가지세요.', recommendationTone: '마음에 남을 공감과 영감을 중심으로 전달합니다.' },
    'INFP': { personaTitle: '몽환적 공간 상상가', personaSummary: '여행지의 감성과 분위기에 깊이 몰입하며 상상력을 펼칩니다.', explorationStyle: '동선보다는 마음이 이끄는 대로 움직이며 감상을 기록해보세요.', recommendationTone: '감성적이고 시적인 언어로 특별한 순간을 선사합니다.' },
    'ENFJ': { personaTitle: '영감을 나누는 탐험 스토리텔러', personaSummary: '여행지의 이야기를 통해 타인과 연결되는 가치를 발견합니다.', explorationStyle: '가족이나 친구와 함께 방문하여 해설을 듣고 이야기를 나누어보세요.', recommendationTone: '사회적 의미와 사람들 사이의 연결고리를 조명합니다.' },
    'ENFP': { personaTitle: '자유로운 공간 발견가', personaSummary: '새로운 여행지를 발견하고 다양한 가능성을 탐험하는 것을 즐깁니다.', explorationStyle: '여러 공간을 가볍게 탐험하고 체험 프로그램에 참여해보세요.', recommendationTone: '설렘과 기대감을 높이는 흥미로운 가능성을 제시합니다.' },
    'ISTJ': { personaTitle: '철저한 기록 탐험가', personaSummary: '체계적으로 사실을 파헤치며 검증된 정보와 전통을 중시합니다.', explorationStyle: '안내판 하나하나를 꼼꼼히 읽으며 세부 내용까지 놓치지 마세요.', recommendationTone: '정확한 역사적 사실과 신뢰할 수 있는 세부 정보를 바탕으로 합니다.' },
    'ISFJ': { personaTitle: '섬세한 공간 수호자', personaSummary: '조용히 공간의 섬세한 가치를 느끼며 전통을 존중합니다.', explorationStyle: '여유 있게 걸으며 느린 걸음으로 이 여행지의 정취를 음미하세요.', recommendationTone: '전통적 가치와 따뜻한 정서를 중심으로 정성껏 추천합니다.' },
    'ESTJ': { personaTitle: '효율적인 코스 마스터', personaSummary: '효율적으로 계획된 동선으로 여행지를 체계적으로 탐방합니다.', explorationStyle: '동선과 일정을 사전에 계획하고 안내 지도를 적극 활용하세요.', recommendationTone: '시간 대비 가장 효율적이고 가치 있는 탐험을 제안합니다.' },
    'ESFJ': { personaTitle: '따뜻한 공간 공유자', personaSummary: '여행지를 통해 타인과 연결되며 함께하는 경험을 소중히 여깁니다.', explorationStyle: '추천 코스를 따라가면서 소중한 순간을 사진으로 남겨보세요.', recommendationTone: '같이 나누고 싶은 특별한 여행을 추천합니다.' },
    'ISTP': { personaTitle: '구조를 꿰뚫는 실전 탐험가', personaSummary: '직접 체험하며 공간의 실용적 기능과 구조를 파악하는 것을 즐깁니다.', explorationStyle: '직접 만져보고 관찰하며 VR 콘텐츠 등에 도전해보세요.', recommendationTone: '직접 체험할 수 있는 요소와 구조적 특징을 중심으로 합니다.' },
    'ISFP': { personaTitle: '감성을 담는 순간 포착가', personaSummary: '공간의 미적 아름다움과 순간의 분위기를 섬세하게 느낍니다.', explorationStyle: '카메라를 챙겨 붐비지 않는 시간의 자연광을 담아보세요.', recommendationTone: '미적 감각과 분위기를 중심으로 당신의 감성을 채워줄 추천을 전합니다.' },
    'ESTP': { personaTitle: '활동적인 공간 모험가', personaSummary: '빠르게 움직이며 다양한 여행지를 직접 경험하고 즐깁니다.', explorationStyle: '야외 공간이나 체험 프로그램이 풍부한 곳으로 이동해보세요.', recommendationTone: '몸으로 배우고 즐기는 에너지 넘치는 탐험을 제안합니다.' },
    'ESFP': { personaTitle: '열정으로 빛나는 탐험 인플루언서', personaSummary: '여행지의 생동감 있는 매력을 즐기며 주변과 공유합니다.', explorationStyle: '공연, 축제, 체험 프로그램이 있는 활기찬 공간을 찾아보세요.', recommendationTone: '재미와 즐거움, 생동감을 에너지 넘치게 추천합니다.' }
  };

  return defaults[mbti] || {
    personaTitle: '공간 탐험가',
    personaSummary: '역사와 감성을 경험하며, 자신만의 탐험 스타일로 공간을 탐구하는 여행자입니다.',
    explorationStyle: '자신의 편한 속도로 둘러보며, 느낀 점을 소중히 여기세요.',
    recommendationTone: '다양한 관점에서 이 여행지의 매력을 소개합니다.'
  };
}