# 문화재청 데이터 다운로드 가이드

## 방법 2: CSV → JSON 변환 (권장)

### 1단계: 공공데이터포털 가입 및 로그인

1. https://www.data.go.kr/ 접속
2. 회원가입 (간편인증 또는 공동인증서)
3. 로그인

### 2단계: 문화재 데이터 다운로드

1. https://www.data.go.kr/data/3070426/fileData.do 접속
   - 또는 공공데이터포털 검색창에 "국가유산청 국가유산 정보" 검색

2. **파일데이터** 탭 클릭

3. 최신 CSV 파일 다운로드
   - 파일명 예시: `국가유산정보_2024_12.csv`
   - 약 15,000개 문화유산 데이터

### 3단계: 파일 저장

다운로드 받은 CSV 파일을 `scripts/` 폴터에 `heritage.csv`로 저장:

```
heritage-mbti/
├── scripts/
│   ├── heritage.csv          ← 여기에 저장!
│   └── download-heritage-data.js
└── lib/
    └── data/
        └── heritages.json    ← 여기에 생성됨
```

### 4단계: 변환 스크립트 실행

```bash
cd C:\Users\nyh7071\Desktop\heritage-mbti
node scripts/download-heritage-data.js
```

### 5단계: 결과 확인

```
🎉 변환 완료!
📁 출력 파일: C:\Users\nyh7071\Desktop\heritage-mbti\lib\data\heritages.json
📊 총 15023개 문화유산 변환됨

📈 통계:
  - 추천 문화유산: 2341개
  - 지역별 분포:
    seoul: 1234개
    gyeonggi: 2341개
    gangwon: 1234개
    ...
```

### 주의사항

1. **데이터 크기**: 15,000개 파일은 약 5-10MB
2. **이미지**: CSV에는 이미지 URL이 없어서 별도로 추가해야 함
3. **빌드 속도**: 15,000개 데이터로 빌드하면 느려질 수 있음
   - 권장: 500~1000개만 사용하거나 필터링

### 대안: API 직접 호출 (인증키 필요)

CSV 대신 실시간 API를 사용하려면:

1. https://www.data.go.kr/data/15017366/openapi.do
2. 활용신청 → 인증키 발급
3. `.env.local` 파일에 추가:
```
HERITAGE_API_KEY=your_api_key_here
```

### 문제 해결

**Q: 한글 깨짐 현상**
- CSV 파일을 UTF-8로 저장 후 다시 시도

**Q: 메모리 부족 오류**
- scripts/download-heritage-data.js에서 `maxItems` 제한 추가:
```javascript
const heritageData = convertToHeritageFormat(parsedData.slice(0, 1000));
```

**Q: 빌드 너무 느림**
- 15,000개 대신 1,000개만 사용하세요
- 또는 필터링하여 국보/볼/천연기념물만 선택
