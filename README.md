# 유산찾기 - MBTI 기반 문화유산 여행 추천 서비스

나의 성향에 맞는 전국 문화유산 여행지를 추천받는 큐레이션 플랫폼입니다.

![프로젝트 스크린샷](https://images.unsplash.com/photo-1548115184-bc2b97d34781?w=800)

## ✨ 주요 기능

### 1. MBTI 기반 성향 분석
- 12개 문항으로 간단하게 나의 문화유산 탐방 성향 파악
- E/I, N/S, T/F, J/P 4가지 차원 분석
- 개인화된 페르소나 생성

### 2. 전국 문화유산 추천
- 서울, 경기, 강원, 충청, 전라, 경상, 제주 8개 권역 커버
- 30개 이상의 대표 문화유산 데이터
- 성향 매칭 점수와 추천 이유 제공

### 3. 지역 필터링
- MBTI 결과 + 지역 필터 동시 적용 가능
- "INFP에게 맞는 전북 문화유산"처럼 세분화된 검색

### 4. 문화유산 상세 정보
- 역사 중심 / 감성 중심 이중 탭 설명
- 추천 방문 시간대, 탐방 포인트
- 주변 유산 연계 정보

### 5. AI 페르소나 생성 (OpenAI)
- MBTI 기반 개인화된 탐방 스타일 분석
- 자연스러운 문장으로 된 추천 코멘트

## 🛠 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State**: React Context / Local Storage
- **AI**: OpenAI API (GPT-4o-mini)
- **Data**: Local JSON

## 🚀 시작하기

### 1. 설치

```bash
# 프로젝트 폴터로 이동
cd heritage-mbti

# 의존성 설치
npm install

# tailwindcss-animate 설치 (필수)
npm install tailwindcss-animate
```

### 2. 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

`.env.local` 파일에 OpenAI API 키를 입력하세요:

```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

> OpenAI API 키는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.
> API 키가 없어도 기본 기능은 정상 작동합니다. (기본 페르소나 제공)

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
heritage-mbti/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── generate-persona/     # OpenAI API 엔드포인트
│   ├── test/                     # MBTI 테스트 페이지
│   ├── result/                   # 결과 페이지
│   ├── heritage/[id]/            # 문화유산 상세 페이지
│   ├── page.tsx                  # 메인 페이지
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── quiz/                     # 퀴즈 컴포넌트
│   ├── heritage/                 # 문화유산 카드, 필터
│   └── layout/                   # 헤더, 푸터
├── lib/
│   ├── data/
│   │   ├── heritages.json        # 30개 문화유산 데이터
│   │   └── questions.json        # MBTI 질문 12개
│   ├── types.ts                  # TypeScript 타입 정의
│   ├── recommendation.ts         # 추천 알고리즘
│   └── utils.ts                  # 유틸리티 함수
├── public/
│   └── images/                   # 정적 이미지
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 🧮 추천 알고리즘

MBTI 각 차원별로 문화유산 속성에 가중치를 부여하여 매칭 점수를 계산합니다:

| MBTI | 선호 속성 | 가중치 |
|------|----------|--------|
| E (외향) | popularityScore (인기) | 1.5x ~ 1.8x |
| I (내향) | quietScore (조용함) | 1.5x ~ 1.8x |
| N (직관) | imaginationScore (상상력) | 1.3x ~ 1.8x |
| S (감각) | historyScore (역사성) | 1.2x ~ 1.8x |
| T (사고) | analysisScore (분석) | 1.4x ~ 1.8x |
| F (감정) | emotionalScore (감성) | 1.4x ~ 1.8x |
| J (판단) | structuredCourseScore (계획) | 1.3x ~ 1.8x |
| P (인식) | freeExploreScore (자유) | 1.2x ~ 1.6x |

### 점수 계산 예시 (INFJ)

```typescript
const weights = {
  popularityScore: 0.6,  // 낮은 선호
  quietScore: 1.6,       // 높은 선호
  imaginationScore: 1.8, // 매우 높은 선호
  historyScore: 1.0,
  analysisScore: 0.7,    // 낮은 선호
  emotionalScore: 1.8,   // 매우 높은 선호
  structuredCourseScore: 1.2,
  freeExploreScore: 1.0,
  natureScore: 1.4
};
```

## 📊 포함된 문화유산

총 30개의 문화유산이 포함되어 있습니다:

### 서울 (3개)
- 경복궁, 창덕궁, 북촌한옥마을

### 경기/인천 (2개)
- 수원 화성, 인천 송도 센트럴파크

### 강원 (2개)
- 오대산 월정사, 설악산 신흥사

### 충청/대전 (4개)
- 공주 공산성, 부여 나성, 부여 정림사지, 대전 현충원

### 전라/광주 (6개)
- 전주한옥마을, 전주 경기전, 순천 낙안읍성, 광주 5.18 기념공원, 여수 향일암

### 경상/부산/대구 (7개)
- 경주 불국사, 경주 석굴암, 경주 대릉원, 안동 하회마을, 안동 병산서원, 대구 동화사, 영주 부석사

### 제주 (2개)
- 성산일출봉, 곶자왈

## 🔌 OpenAI 연동

OpenAI API는 다음 역할을 수행합니다:

1. **페르소나 타이틀 생성**: 각 MBTI별 창의적인 탐방가 타입명
2. **성향 요약**: 해당 MBTI의 문화유산 탐방 특성 요약
3. **탐방 스타일**: 구체적인 탐방 방법과 주의사항
4. **추천 톤**: 해당 유형에게 맞는 추천 문구 스타일

### API 요청 예시

```typescript
const response = await fetch('/api/generate-persona', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    mbti: 'INFJ', 
    topHeritages: [...] 
  }),
});

const persona = await response.json();
// { personaTitle, personaSummary, explorationStyle, recommendationTone }
```

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **깔끔한 감성**: 문화유산 큐레이션 플랫폼에 어울는 세련된 디자인
- **인터랙티브**: 카드 호버 효과, 부드러운 전환 애니메이션
- **접근성**: 시멘틱 HTML, 키보드 네비게이션 지원

## 📝 주요 페이지 설명

### 메인 페이지 (`/`)
- 서비스 소개와 CTA
- 특집 문화유산 미리보기
- 지역별 통계

### 테스트 페이지 (`/test`)
- 12개 질문 진행률 표시
- 이전/다음 네비게이션
- 자동 저장 기능

### 결과 페이지 (`/result`)
- MBTI 결과와 페르소나 표시
- 지역 필터링
- 추천 문화유산 목록 (점수순)
- 추천 코스 제안

### 상세 페이지 (`/heritage/[id]`)
- 역사/감성 탭 설명
- 성향 매칭 점수
- 주변 유산 연계
- 탐방 가이드

## 🚀 향후 확장 아이디어

1. **사용자 계정 시스템**
   - 테스트 결과 저장 및 비교
   - 방문한 유산 체크 기능

2. **리뷰 및 평가**
   - 사용자 리뷰 및 별점
   - 사진 업로드 기능

3. **코스 생성기**
   - 선택한 유산으로 1일/2일 코스 자동 생성
   - 이동 시간 및 거리 계산

4. **실시간 정보**
   - 날씨 연동
   - 주차 정보, 입장료 등 실시간 데이터

5. **소셜 기능**
   - 결과 공유하기 (카카오톡, 인스타그램)
   - 친구와 성향 비교

6. **추가 데이터**
   - 식당, 카페 등 주변 가게 정보
   - 지역 축제 일정 연동

7. **다국어 지원**
   - 영어, 일어, 중국어 버전

## 📄 라이선스

MIT License

## 🤝 기여하기

이슈와 PR은 언제나 환영입니다!

## 📧 문의

프로젝트 관련 문의사항은 이슈로 남겨주세요.

---

Made with ❤️ for Korean Heritage
