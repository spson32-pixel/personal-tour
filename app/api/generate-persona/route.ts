import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MBTIType, Heritage } from '@/lib/types';

// OpenAI 클라이언트 초기화 (API 키 없이도 초기화 가능)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * MBTI 기반 페르소나 생성 API
 * 
 * 요청: { mbti: MBTIType, topHeritages: Heritage[] }
 * 응답: { personaTitle, personaSummary, explorationStyle, recommendationTone }
 * 
 * OpenAI를 사용하여 사용자의 MBTI와 추천된 문화유산을 기반으로
 * 개인화된 페르소나와 탐방 스타일을 생성합니다.
 */
export async function POST(request: NextRequest) {
  let locale = 'ko';
  try {
    const body = await request.json();
    const { mbti, topHeritages, locale: bodyLocale = 'ko' } = body as {
      mbti: MBTIType;
      topHeritages: Heritage[];
      locale?: string;
    };
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
你是一位文化遗产策展专家。
请根据用户的MBTI性格类型及推荐的旅行地，生成个性化的探索者角色。

[用户信息]
- MBTI: ${mbti}

[推荐旅行地]
${heritageInfo.map((h, i) => `${i + 1}. ${h.name} (${h.region})
   - 特征: ${h.tags.join(', ')}
   - 描述: ${h.summary}`).join('\n\n')}

[输出要求]
请以如下JSON格式回复。所有值必须用简体中文书写：

{
  "personaTitle": "创意探索者类型名称（不超过10个汉字，例：'感性历史漫步者'、'分析型文化探究者'）",
  "personaSummary": "150字以内的性格摘要——描述该MBTI类型观察旅行地的独特视角",
  "explorationStyle": "200字以内的探索风格说明——该性格偏好的游览方式及实用建议",
  "recommendationTone": "150字以内——向该类型用户推荐旅行地时的语气与方式"
}

[重要指导原则]
1. 准确体现MBTI四个维度（E/I、N/S、T/F、J/P）的性格特征
2. 与推荐旅行地的特点（自然、历史、建筑等）相结合
3. 包含实用且具体的建议
4. 保持温暖、富有共情的语调
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
  "personaTitle": "A creative explorer type name (max 8 words, e.g. 'Analytical Heritage Scholar', 'Dreamy Cultural Wanderer')",
  "personaSummary": "A summary of personality traits in under 150 words — how this MBTI type uniquely experiences cultural heritage",
  "explorationStyle": "Exploration style description in under 200 words — preferred touring style and practical tips for this personality",
  "recommendationTone": "Under 150 words — the tone and approach for recommending heritage sites to this type"
}

[Key Guidelines]
1. Accurately reflect all four MBTI dimensions (E/I, N/S, T/F, J/P)
2. Connect to the characteristics of the recommended heritage sites (nature, history, architecture, etc.)
3. Include practical and specific advice
4. Maintain a warm, empathetic tone
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
    
    // 오류 발생 시 기본 응답 반환
    return NextResponse.json(getDefaultPersona(mbti, locale));
  }
}

/**
 * 기본 페르소나 생성 (OpenAI 오류 시 폭백)
 */
function getDefaultPersona(mbti: MBTIType, locale: string = 'ko') {
  if (locale === 'zh') {
    const zhDefaults: Record<string, {
      personaTitle: string;
      personaSummary: string;
      explorationStyle: string;
      recommendationTone: string;
    }> = {
      'INTJ': {
        personaTitle: '战略型空间分析家',
        personaSummary: '探索前系统收集大量背景知识，分析空间的脉络与结构价值。高效、目标导向的探索是你独特的方式。',
        explorationStyle: '充分调研后聚焦核心要点高效探索。善用语音导览或专业解说，加深理解深度。',
        recommendationTone: '以逻辑方式解读这个空间蕴含的历史脉络与建筑价值，清晰阐明为何这里是你旅程中不可或缺的一站。'
      },
      'INTP': {
        personaTitle: '好奇知识探索者',
        personaSummary: '对空间的原理与结构充满无尽好奇，构建独创性的诠释。比起既定答案，更享受自我探究的过程。',
        explorationStyle: '不受行程束缚，自由探索。有疑问时立刻深入追究，享受构建自己独特解读的过程。',
        recommendationTone: '以事实与逻辑为基础，引导你探索这个空间隐藏的多层次意义。'
      },
      'ENTJ': {
        personaTitle: '有远见的探索领导者',
        personaSummary: '重视旅行地的战略价值与现代意义，以明确目标为中心引领高效探索。',
        explorationStyle: '设定明确目标与动线，以核心旅行地为中心快速掌握全局。自主规划路线独立探索才是最优方式。',
        recommendationTone: '以旅行地所具备的影响力与现代价值为中心，结合具体战略启示提出建议。'
      },
      'ENTP': {
        personaTitle: '创意空间解读者',
        personaSummary: '用全新视角重新诠释旅行地，探索传统与现代的连结。享受开放的各种可能性与即兴发现。',
        explorationStyle: '比起固定路线，更享受意外的发现。与其他访客交流，获得截然不同的视角也是极好的探索方式。',
        recommendationTone: '用与众不同的有趣视角和隐藏故事激发你的好奇心，带来重新审视这个空间的乐趣。'
      },
      'INFJ': {
        personaTitle: '深度洞察的沉思探索者',
        personaSummary: '深刻感受空间中人们的故事与意义，并与内心成长相连结。宁静而有意义的时光是此次探索的核心。',
        explorationStyle: '不要着急，慢慢感受空间。避开人多的时段，充分享受独自宁静沉思的时光。',
        recommendationTone: '以这个空间中人们的故事与深深的感动为中心，传递能久久留在心中的共鸣与灵感。'
      },
      'INFP': {
        personaTitle: '梦幻空间幻想家',
        personaSummary: '深深沉浸于旅行地的感性与氛围，以想象力超越时空进行探索。在安静美丽的空间中获得最大灵感。',
        explorationStyle: '不必在意动线，随心而行。带上笔记本或素描本，随时记录在空间中涌现的感受。',
        recommendationTone: '用感性而诗意的语言传递旅行地的氛围与感觉，带来在想象中超越时空的特别时刻。'
      },
      'ENFJ': {
        personaTitle: '传递灵感的探索讲述者',
        personaSummary: '通过旅行地的故事与他人连结，在共同探索中发现共同体价值。分享故事与传递灵感是你的探索方式。',
        explorationStyle: '与家人或朋友同行。参加解说项目或将发现的故事分享给身边的人，让体验加倍丰富。',
        recommendationTone: '聚焦旅行地所具有的社会意义与人与人之间的连结，强调共同探索的珍贵价值。'
      },
      'ENFP': {
        personaTitle: '自由的空间发现者',
        personaSummary: '享受发现新旅行地并探索各种可能性的乐趣。充满活力与热情的探索让你在意想不到的瞬间最为闪耀。',
        explorationStyle: '轻松游览多个空间也无妨。与当地人随意交流或参加体验项目，享受意想不到的乐趣。',
        recommendationTone: '不断提示有趣的可能性，提升对尚未发现的惊喜的期待与兴奋感。'
      },
      'ISTJ': {
        personaTitle: '严谨的记录探索者',
        personaSummary: '系统地探究事实，重视经过验证的信息与传统。通过准确深入的探索发掘空间的真实价值。',
        explorationStyle: '充分准备后，按顺序系统探索。认真阅读每一块指示牌，不错过细节，是你的最大优势。',
        recommendationTone: '以准确的历史事实与可信赖的详细信息为基础，提供完美准备探索所需的全部信息。'
      },
      'ISFJ': {
        personaTitle: '细腻的空间守护者',
        personaSummary: '静静感受空间的细腻价值，深深尊重传统与时间的流逝。在宁静的空间中找到心灵的平静与慰藉。',
        explorationStyle: '悠闲漫步，全身融入空间的氛围。打开心扉感受细微之处，用缓慢的步伐充分品味旅行地的韵味。',
        recommendationTone: '以这个空间蕴含的传统价值与温暖情感为中心，给你留下深刻印象的真诚推荐。'
      },
      'ESTJ': {
        personaTitle: '高效路线达人',
        personaSummary: '以高效规划的路线系统探访旅行地，重视实用信息与明确目标。',
        explorationStyle: '提前规划动线与行程，以核心旅行地为中心快速掌握。积极利用导览地图和语音导览，发挥最大效率。',
        recommendationTone: '以实用信息和明确理由为先，提出时间效益最高、价值最大的探索方案。'
      },
      'ESFJ': {
        personaTitle: '温暖的空间分享者',
        personaSummary: '通过旅行地与他人连结，重视共同体验的珍贵。在温暖的氛围中最为闪耀的探索者。',
        explorationStyle: '与家人或朋友同行，沿推荐路线游览，用照片留下珍贵时刻。共同的记忆是此次探索最大的礼物。',
        recommendationTone: '以可以共同享受的元素和温暖的共同体体验为中心，推荐想要一起分享的特别旅行。'
      },
      'ISTP': {
        personaTitle: '洞悉结构的实战探索者',
        personaSummary: '享受直接体验并把握空间实用功能与结构的乐趣。在自由探索与理解原理的过程中感受真正的快乐。',
        explorationStyle: '直接触摸观察，把握这个空间的结构与原理。如有体验项目或VR内容，务必尝试。',
        recommendationTone: '以可直接体验的元素和结构特点为中心，为充满好奇心的实战探险家提供专属信息。'
      },
      'ISFP': {
        personaTitle: '捕捉感性瞬间的艺术家',
        personaSummary: '细腻感受空间的美学之美与瞬间氛围，深深品味。在宁静的环境中发现美丽瞬间是探索的核心。',
        explorationStyle: '带上相机或素描本。避开人多时段，选择自然光最美的时刻，完整捕捉这个空间独有的美丽。',
        recommendationTone: '以旅行地的美学感觉与氛围、细腻的感性体验为中心，为你的感性世界带来丰富推荐。'
      },
      'ESTP': {
        personaTitle: '活跃的空间冒险家',
        personaSummary: '快速穿梭于各旅行地之间，直接体验并享受。在活动性与生动感的探索中获得能量。',
        explorationStyle: '穿梭于各旅行地之间，积累丰富体验。户外空间或体验项目丰富的地方最适合你的探索风格。',
        recommendationTone: '强调活动性与直接体验，提出身体力行、充满活力的探索建议。'
      },
      'ESFP': {
        personaTitle: '热情闪耀的探索达人',
        personaSummary: '享受旅行地的生动魅力，并与周围人分享这份体验。在活跃的氛围中最为闪耀的探索者。',
        explorationStyle: '与朋友同行，积极寻找有演出、节庆、体验项目的生动空间。活跃的氛围让你的探索更加精彩。',
        recommendationTone: '以乐趣、快乐与活力为中心，充满能量地推荐想要一起分享的体验。'
      }
    };

    return zhDefaults[mbti] || {
      personaTitle: '空间探索者',
      personaSummary: '通过各地旅行地体验历史与感性，以自己独特的探索风格探究空间的旅行者。',
      explorationStyle: '以自己舒适的节奏游览，珍视每一份感受。',
      recommendationTone: '从多种视角介绍这个旅行地的魅力。'
    };
  }

  if (locale === 'en') {
    const enDefaults: Record<string, {
      personaTitle: string;
      personaSummary: string;
      explorationStyle: string;
      recommendationTone: string;
    }> = {
      'INTJ': {
        personaTitle: 'Strategic Destination Analyst',
        personaSummary: 'You systematically gather background knowledge before every visit, analyzing each destination\'s context and structural significance. Efficient, purposeful exploration is your signature style.',
        explorationStyle: 'Thorough prior research is your superpower — move efficiently through key highlights and deepen your experience with audio guides or expert commentary.',
        recommendationTone: "I'll walk you through this destination's historical context and architectural significance, making a clear logical case for why it belongs on your itinerary."
      },
      'INTP': {
        personaTitle: 'Curious Knowledge Explorer',
        personaSummary: 'Your curiosity about the principles and structures behind each destination drives you to form original, independent interpretations. You prefer deep inquiry over surface-level explanations.',
        explorationStyle: 'Give yourself ample unstructured time to wander and wonder. When a question surfaces, search it out or jot it down — enjoy crafting your own unique interpretation.',
        recommendationTone: 'Facts and logic provide the framework; multiple layers of interpretation await your own exploration of this remarkable space.'
      },
      'ENTJ': {
        personaTitle: 'Visionary Exploration Leader',
        personaSummary: 'You value the strategic significance and contemporary relevance of each destination, leading efficient and goal-centered exploration with clear purpose.',
        explorationStyle: 'Set clear goals and a defined route, then zero in on the core highlights efficiently. Independent exploration suits you far better than a guided tour.',
        recommendationTone: 'Presenting this destination through its influence and contemporary relevance, paired with concrete strategic takeaways for your journey.'
      },
      'ENTP': {
        personaTitle: 'Creative Space Interpreter',
        personaSummary: 'You reinterpret destinations through fresh perspectives, exploring the connections between tradition and modernity. Spontaneous discoveries and open possibilities are your ideal.',
        explorationStyle: 'Serendipitous finds beat a rigid itinerary any day. Strike up a conversation with fellow visitors — a completely fresh perspective could be just around the corner.',
        recommendationTone: 'Sparking your curiosity through unconventional angles and hidden stories that make you see this space in a completely new light.'
      },
      'INFJ': {
        personaTitle: 'Deep-Insight Contemplative Explorer',
        personaSummary: 'You deeply feel the human stories and meaning embedded in each space, connecting them to your own inner growth. Quiet, purposeful exploration is your ideal.',
        explorationStyle: 'Linger at your own pace and let the space speak to you. Avoid peak-hour crowds and carve out dedicated time for quiet personal reflection.',
        recommendationTone: 'Centering the emotional resonance and human stories woven into this space — delivering empathy and lasting inspiration.'
      },
      'INFP': {
        personaTitle: 'Dreamy Space Imaginer',
        personaSummary: 'You immerse deeply in the emotion and atmosphere of each destination, traveling through time with your imagination. Beautiful, quiet spaces are where you find your greatest inspiration.',
        explorationStyle: 'Follow your heart rather than a fixed route. Bring a journal or sketchbook to capture the impressions and feelings that naturally arise as you explore.',
        recommendationTone: 'Conveying the feeling and atmosphere of this destination through evocative, almost poetic language — inviting you to transcend time through imagination.'
      },
      'ENFJ': {
        personaTitle: 'Inspiring Exploration Storyteller',
        personaSummary: 'You find meaning in connecting with others through the stories of each destination, valuing shared community experiences above all. Sharing and inspiring is your exploration style.',
        explorationStyle: 'Visit with family or friends — guided programs are especially rewarding for you. The joy of sharing what you\'ve discovered with others multiplies the experience.',
        recommendationTone: 'Underscoring the social meaning of this destination, with a focus on human connection and shared discovery.'
      },
      'ENFP': {
        personaTitle: 'Free-Spirited Space Discoverer',
        personaSummary: 'You love discovering new destinations and exploring diverse possibilities with boundless enthusiasm and energy. Unexpected moments are where you shine brightest.',
        explorationStyle: "Dip lightly into multiple spaces — and don't miss a chance to chat with locals or join a hands-on program for a richer, more spontaneous experience.",
        recommendationTone: 'Surfacing exciting possibilities at every turn and building real anticipation for the discoveries still ahead of you.'
      },
      'ISTJ': {
        personaTitle: 'Meticulous Record-Keeper Explorer',
        personaSummary: 'You systematically investigate facts and prioritize verified information and tradition. Accurate, in-depth exploration uncovers the true value of every space you visit.',
        explorationStyle: 'Thorough preparation first, then a systematic visit in proper sequence. Read every information panel carefully — the finer details reward your diligent attention.',
        recommendationTone: 'Grounded in precise historical facts and detailed information you can rely on completely — everything you need for a perfectly prepared exploration.'
      },
      'ISFJ': {
        personaTitle: 'Gentle Space Guardian',
        personaSummary: 'You quietly appreciate the subtle details of each space, deeply respecting tradition and the passage of time. Quiet destinations bring you peace of mind and comfort.',
        explorationStyle: 'Slow down and let the atmosphere wash over you. Keep your senses open to the small details, and savor the mood of each destination at a gentle, unhurried pace.',
        recommendationTone: 'Centered on the traditional values and warm, caring spirit of this destination — a heartfelt, personal recommendation just for you.'
      },
      'ESTJ': {
        personaTitle: 'Efficient Course Master',
        personaSummary: 'You systematically tour destinations with an efficiently planned route, prioritizing practical information and clear objectives at every step.',
        explorationStyle: 'Plan your route and schedule in advance, then absorb the key highlights efficiently. Make the most of the site map, audio guides, and directional signage.',
        recommendationTone: 'Practical information and clear reasoning front and center — helping you make the most time-efficient, high-value exploration choice.'
      },
      'ESFJ': {
        personaTitle: 'Warm Space Sharer',
        personaSummary: 'You value connecting with others through each destination, cherishing shared experiences above all. You shine brightest as an explorer in warm, welcoming atmospheres.',
        explorationStyle: 'Visit with family or friends, follow a recommended itinerary, and take plenty of photos to preserve the shared memories you\'ll treasure.',
        recommendationTone: 'Recommending experiences you can enjoy and share together, with a focus on warm communal moments and lasting memories.'
      },
      'ISTP': {
        personaTitle: 'Hands-On Structure Explorer',
        personaSummary: 'You enjoy grasping the practical mechanics and structure of each space through direct, hands-on exploration. You love to roam freely and understand how things work.',
        explorationStyle: 'Touch things, examine the structure, and figure out how it all works. Hands-on programs and immersive content like VR are especially rewarding for your style.',
        recommendationTone: 'Spotlighting the tactile, experiential elements and structural features that reward a curious, hands-on investigator like you.'
      },
      'ISFP': {
        personaTitle: 'Soulful Moment Capturer',
        personaSummary: 'You subtly feel the aesthetic beauty and momentary atmosphere of each space, savoring deep appreciation in quiet surroundings. Finding beautiful moments in stillness is your exploration.',
        explorationStyle: 'Bring your camera or sketchbook. Avoid the busy hours and choose a time when the natural light is at its most beautiful — then let this space\'s beauty speak to you.',
        recommendationTone: 'Centered on aesthetic beauty, atmosphere, and the rich sensory experience this destination offers — a recommendation that speaks to your soul.'
      },
      'ESTP': {
        personaTitle: 'Active Space Adventurer',
        personaSummary: 'You swiftly move through diverse destinations and enjoy direct, hands-on engagement. Active, vibrant exploration is where you find your energy.',
        explorationStyle: 'Cover ground, try different things, and stack up diverse experiences. Outdoor spaces and places with hands-on activities are your perfect exploration match.',
        recommendationTone: 'Emphasizing direct action and hands-on experience — an energetic itinerary built for someone who truly learns by doing.'
      },
      'ESFP': {
        personaTitle: 'Passionate Exploration Enthusiast',
        personaSummary: 'You enjoy the vibrant, lively elements of each destination and love sharing the experience with those around you. You shine brightest in an energetic, lively atmosphere.',
        explorationStyle: 'Head out with friends and keep an eye out for live performances, festivals, or interactive programs — the livelier the atmosphere, the better your exploration.',
        recommendationTone: 'High-energy recommendations centered on fun, spontaneity, and memorable experiences you\'ll want to share with everyone.'
      }
    };

    return enDefaults[mbti] || {
      personaTitle: 'Destination Explorer',
      personaSummary: 'A traveler who experiences history and culture through remarkable spaces, with their own unique exploration style.',
      explorationStyle: 'Explore at your own comfortable pace and treasure every impression you gather along the way.',
      recommendationTone: 'Introducing the appeal of this destination from a variety of perspectives.'
    };
  }

  const defaults: Record<string, {
    personaTitle: string;
    personaSummary: string;
    explorationStyle: string;
    recommendationTone: string;
  }> = {
    'INTJ': {
      personaTitle: '전략적 공간 분석가',
      personaSummary: '탐험 전 방대한 배경 지식을 체계적으로 수집하고, 공간의 맥락과 구조적 가치를 분석합니다. 효율적이고 목적 중심의 탐험이 당신만의 방식입니다.',
      explorationStyle: '방문 전 철저한 조사를 마치고 핵심 포인트만 압축해 효율적으로 탐험하세요. 오디오 가이드나 전문 해설을 활용하면 이해의 깊이가 한층 더해집니다.',
      recommendationTone: '이 공간이 품은 역사적 맥락과 건축적 가치를 논리적으로 풀어드립니다. 왜 이곳이 당신의 여정에 반드시 필요한지, 명확한 근거와 함께 안내해드리겠습니다.'
    },
    'INTP': {
      personaTitle: '호기심의 지식 탐험가',
      personaSummary: '공간의 원리와 구조에 대한 끝없는 호기심으로 독창적인 해석을 만들어냅니다. 정해진 답보다 스스로 탐구하는 과정에서 가장 큰 즐거움을 느낍니다.',
      explorationStyle: '일정에 얽매이지 말고 자유롭게 탐험하세요. 의문이 생기면 즉시 파고들고, 자신만의 독창적인 해석을 만들어가는 과정 자체를 즐기세요.',
      recommendationTone: '사실과 논리를 기반으로 이 공간에 숨겨진 여러 층위의 의미를 탐구할 수 있도록 안내합니다.'
    },
    'ENTJ': {
      personaTitle: '비전 있는 탐험 리더',
      personaSummary: '여행지의 전략적 가치와 현대적 의미를 중시하며, 명확한 목표를 중심으로 효율적인 탐험을 이끌어갑니다.',
      explorationStyle: '명확한 목표와 동선을 설정하고 핵심 여행지를 중심으로 빠르게 파악하세요. 가이드 투어보다는 스스로 설계한 코스로 독립적으로 탐험하는 것이 최적입니다.',
      recommendationTone: '이 여행지가 지닌 영향력과 현대적 가치를 중심으로, 구체적인 전략적 시사점과 함께 제안합니다.'
    },
    'ENTP': {
      personaTitle: '창의적 공간 해석가',
      personaSummary: '여행지를 새로운 관점으로 재해석하며 전통과 현대의 연결고리를 탐구합니다. 다양한 가능성을 열어두고 즉흥적인 발견을 즐깁니다.',
      explorationStyle: '정해진 코스보다 우연한 발견을 즐기세요. 다른 방문객과 대화하며 완전히 다른 시각을 얻는 것도 훌륭한 탐험 방식입니다.',
      recommendationTone: '기존과 다른 흥미로운 시각과 숨겨진 이야기로 당신의 호기심을 자극하며, 이 공간을 새롭게 바라보는 재미를 선사합니다.'
    },
    'INFJ': {
      personaTitle: '깊은 통찰의 사색 탐험가',
      personaSummary: '공간에 담긴 사람들의 이야기와 의미를 깊이 있게 느끼며, 내면적 성장과 연결 짓는 탐험을 추구합니다. 조용하고 의미 있는 시간이 이 탐험의 핵심입니다.',
      explorationStyle: '서두르지 말고 여유롭게 공간을 느끼세요. 붐비는 시간을 피하고 혼자만의 고요한 사색 시간을 충분히 가지는 것이 이 탐험의 핵심입니다.',
      recommendationTone: '이 공간에 담긴 사람들의 이야기와 깊은 감동을 중심으로, 오래도록 마음에 남을 공감과 영감을 전달합니다.'
    },
    'INFP': {
      personaTitle: '몽환적 공간 상상가',
      personaSummary: '여행지의 감성과 분위기에 깊이 몰입하며, 상상력을 통해 시간을 초월하는 탐험을 즐깁니다. 조용하고 아름다운 공간에서 가장 큰 영감을 얻습니다.',
      explorationStyle: '동선보다는 마음이 이끄는 대로 움직이세요. 메모장이나 스케치북을 챙겨 공간에서 피어오르는 감상을 그때그때 기록해보세요.',
      recommendationTone: '감성적이고 시적인 언어로 이 여행지의 분위기와 느낌을 전달하며, 상상 속에서 시간을 초월하는 특별한 순간을 선사합니다.'
    },
    'ENFJ': {
      personaTitle: '영감을 나누는 탐험 스토리텔러',
      personaSummary: '여행지의 이야기를 통해 타인과 연결되며, 함께하는 탐험에서 공동체적 가치를 발견합니다. 이야기를 나누고 영감을 전달하는 것이 당신의 탐험 방식입니다.',
      explorationStyle: '가족이나 친구와 함께 방문하세요. 해설 프로그램에 참여하거나 발견한 이야기를 주변과 나누며 경험을 두 배로 키워보세요.',
      recommendationTone: '이 여행지가 가진 사회적 의미와 사람들 사이의 연결고리를 조명하며, 함께하는 탐험의 소중한 가치를 강조합니다.'
    },
    'ENFP': {
      personaTitle: '자유로운 공간 발견가',
      personaSummary: '새로운 여행지를 발견하고 다양한 가능성을 탐험하는 것을 즐깁니다. 에너지 넘치고 열정적인 탐험으로 예상치 못한 순간에 가장 빛납니다.',
      explorationStyle: '여러 공간을 가볍게 탐험해도 좋습니다. 현지인과 스스럼없이 대화하거나 체험 프로그램에 참여해 예상치 못한 즐거움을 만끽하세요.',
      recommendationTone: '흥미로운 가능성을 끊임없이 제시하며, 아직 만나지 못한 발견에 대한 설렘과 기대감을 높입니다.'
    },
    'ISTJ': {
      personaTitle: '철저한 기록 탐험가',
      personaSummary: '체계적으로 사실을 파헤치며 검증된 정보와 전통을 중시합니다. 정확하고 깊이 있는 탐험으로 공간의 진실한 가치를 발굴합니다.',
      explorationStyle: '충분한 사전 조사 후 순서에 맞게 체계적으로 탐험하세요. 안내판 하나하나를 꼼꼼히 읽으며 세부 내용까지 놓치지 않는 것이 당신의 강점입니다.',
      recommendationTone: '정확한 역사적 사실과 신뢰할 수 있는 세부 정보를 바탕으로, 완벽하게 준비된 탐험을 위한 정보를 제공합니다.'
    },
    'ISFJ': {
      personaTitle: '섬세한 공간 수호자',
      personaSummary: '조용히 공간의 섬세한 가치를 느끼며, 전통과 시간의 흐름을 깊이 존중합니다. 고요한 공간에서 마음의 평화와 위로를 발견합니다.',
      explorationStyle: '여유 있게 걸으며 공간의 분위기에 온몸으로 녹아드세요. 작은 디테일에도 마음을 열고, 느린 걸음으로 이 여행지의 정취를 충분히 음미하세요.',
      recommendationTone: '이 공간이 품은 전통적 가치와 따뜻한 정서를 중심으로, 마음 깊이 남을 정성 어린 추천을 드립니다.'
    },
    'ESTJ': {
      personaTitle: '효율적인 코스 마스터',
      personaSummary: '효율적으로 계획된 동선으로 여행지를 체계적으로 탐방하며, 실용적인 정보와 명확한 목표를 중시합니다.',
      explorationStyle: '동선과 일정을 사전에 계획하고 핵심 여행지를 중심으로 빠르게 파악하세요. 안내 지도와 오디오 가이드를 적극 활용해 최대 효율을 끌어내세요.',
      recommendationTone: '실용적인 정보와 명확한 이유를 앞세워, 시간 대비 가장 효율적이고 가치 있는 탐험을 제안합니다.'
    },
    'ESFJ': {
      personaTitle: '따뜻한 공간 공유자',
      personaSummary: '여행지를 통해 타인과 연결되며, 함께하는 경험의 소중함을 중요하게 여깁니다. 따뜻한 분위기에서 가장 빛나는 탐험가입니다.',
      explorationStyle: '가족이나 친구와 함께 방문하고, 추천 코스를 따라가면서 소중한 순간을 사진으로 남겨보세요. 함께한 기억이 이 탐험의 가장 큰 선물입니다.',
      recommendationTone: '함께 즐길 수 있는 요소와 따뜻한 공동체 경험을 중심으로, 같이 나누고 싶은 특별한 여행을 추천합니다.'
    },
    'ISTP': {
      personaTitle: '구조를 꿰뚫는 실전 탐험가',
      personaSummary: '직접 체험하며 공간의 실용적 기능과 구조를 파악하는 것을 즐깁니다. 자유롭게 탐험하며 원리를 이해하는 과정에서 진짜 즐거움을 느낍니다.',
      explorationStyle: '직접 만져보고 관찰하며 이 공간의 구조와 원리를 파악하세요. 체험 프로그램이나 VR 콘텐츠가 있다면 반드시 도전해보세요.',
      recommendationTone: '직접 체험할 수 있는 요소와 구조적 특징을 중심으로, 호기심 넘치는 실전 탐험가에게 맞춤 정보를 제공합니다.'
    },
    'ISFP': {
      personaTitle: '감성을 담는 순간 포착가',
      personaSummary: '공간의 미적 아름다움과 순간의 분위기를 섬세하게 느끼며 깊이 감상합니다. 고요한 환경에서 아름다운 순간을 발견하는 것이 탐험의 핵심입니다.',
      explorationStyle: '카메라나 스케치북을 챙기세요. 붐비는 시간대를 피하고 자연광이 가장 아름다운 시간을 선택해 이 공간만의 아름다움을 온전히 담아보세요.',
      recommendationTone: '이 여행지의 미적 감각과 분위기, 섬세한 감성적 경험을 중심으로 당신의 감성을 풍성하게 채워줄 추천을 전합니다.'
    },
    'ESTP': {
      personaTitle: '활동적인 공간 모험가',
      personaSummary: '빠르게 움직이며 다양한 여행지를 직접 경험하고 즐깁니다. 활동적이고 생동감 있는 탐험에서 에너지를 얻습니다.',
      explorationStyle: '여러 여행지를 이동하며 다채로운 경험을 쌓으세요. 야외 공간이나 체험 프로그램이 풍부한 곳이 당신에게 딱 맞는 탐험지입니다.',
      recommendationTone: '활동적이고 직접적인 경험을 강조하며, 몸으로 배우고 즐기는 에너지 넘치는 탐험을 제안합니다.'
    },
    'ESFP': {
      personaTitle: '열정으로 빛나는 탐험 인플루언서',
      personaSummary: '여행지의 생동감 있는 매력을 즐기며 주변과 함께 그 경험을 나누는 것을 소중히 여깁니다. 활기찬 분위기에서 가장 빛나는 탐험가입니다.',
      explorationStyle: '친구들과 함께 방문하고, 공연·축제·체험 프로그램이 있는 생동감 넘치는 공간을 적극적으로 찾아보세요. 활기찬 분위기가 당신의 탐험을 더욱 빛나게 합니다.',
      recommendationTone: '재미와 즐거움, 생동감을 중심으로 함께 나누고 싶은 경험을 에너지 넘치게 추천합니다.'
    }
  };

  return defaults[mbti] || {
    personaTitle: '공간 탐험가',
    personaSummary: '각지의 여행지를 통해 역사와 감성을 경험하며, 자신만의 탐험 스타일로 공간을 탐구하는 여행자입니다.',
    explorationStyle: '자신의 편한 속도로 둘러보며, 느낀 점을 소중히 여기세요.',
    recommendationTone: '다양한 관점에서 이 여행지의 매력을 소개합니다.'
  };
}
