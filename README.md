# Look at the Music

![Look at the Music](https://img.shields.io/badge/Look%20at%20the%20Music-v1.0-blue)

음악 감상과 함께 시각적인 경험을 제공하는 웹 기반 뮤직 플레이어입니다. YouTube 음악을 검색하고 재생하면서 앨범 아트의 대표색을 추출하여 UI에 적용합니다. '집중하기' 모드에서는 전체 화면으로 전환되어 음악과 색상에 몰입할 수 있는 환경을 제공합니다.
![Image](https://github.com/user-attachments/assets/9697f861-b871-4053-be9c-2719dab82601)
## 🎵 주요 기능

### 음악 검색 및 재생
- YouTube Data API를 활용한 음악 검색
- 검색 결과에서 원하는 곡 선택 및 재생
- 재생/일시정지 컨트롤

### 시각적 경험
- 앨범 아트 썸네일에서 대표색 자동 추출
- 추출된 대표색을 UI 요소에 적용
- 최적의 썸네일 자동 선택 (검은색 여백 없는 16:9 비율 우선)

### 집중 모드
- 전체 화면 전환으로 몰입감 증대
- 앨범 아트와 추출된 색상을 활용한 배경 효과
- 불필요한 UI 요소 숨김으로 집중력 향상
- ESC 키 또는 화면 클릭으로 쉽게 종료
- ![Image](https://github.com/user-attachments/assets/81a5d890-a0f0-42af-8170-f5b121fdfefc)

## 🚀 설치 및 설정

1. 이 저장소를 클론합니다:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Look-at-the-Music.git
   cd Look-at-the-Music
   ```

2. config.js 파일을 설정합니다:
   ```bash
   cp js/config.js.example js/config.js
   ```

3. 텍스트 에디터에서 `js/config.js` 파일을 열고 YouTube API 키를 입력합니다:
   ```javascript
   const CONFIG = {
       YOUTUBE_API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE', // 여기에 실제 API 키를 입력하세요
       YOUTUBE_API_URL: 'https://www.googleapis.com/youtube/v3',
       IS_DEVELOPMENT: true
   };
   ```

4. 로컬 웹 서버로 실행:
   ```bash
   # Python 3
   python -m http.server
   
   # 또는 Node.js
   npx serve
   ```

5. 브라우저에서 `http://localhost:8000`으로 접속합니다.

## 📋 사용 방법

1. **음악 검색**: 검색창에 원하는 곡 제목이나 아티스트를 입력하고 Enter 키를 누릅니다.
2. **음악 재생**: 검색 결과에서 원하는 곡을 클릭하면 자동으로 재생됩니다.
3. **재생 제어**: 재생/일시정지 버튼으로 음악을 제어할 수 있습니다.
4. **집중 모드**: 상단 메뉴의 '집중하기' 버튼을 클릭하면 전체 화면 집중 모드로 전환됩니다.
5. **집중 모드 종료**: ESC 키를 누르거나 화면 아무 곳이나 클릭하면 일반 모드로 돌아옵니다.

## 🔍 기술적 특징

### 고품질 썸네일 자동 선택
- 여러 YouTube 썸네일 버전 중 최적의 것을 자동으로 선택
- 검은색 여백이 없는 16:9 비율의 썸네일 우선 적용
- 다양한 해상도 지원 (maxresdefault, mqdefault)

### 정확한 색상 추출
- Canvas API와 픽셀 분석을 통한 대표색 추출
- 색상 양자화 및 가중치 적용으로 더 정확한 색상 선정
- 채도 기반 색상 선택 알고리즘으로 눈에 띄는 색상 우선

### 반응형 디자인
- 다양한 화면 크기에 맞는 UI 레이아웃
- 모바일 장치 지원

## 🛠️ 개발자 도구

색상 추출 기능을 테스트하기 위한 별도의 도구가 포함되어 있습니다:

- `color-test.html`: 이미지 URL을 입력하여 대표색을 추출하고 테스트할 수 있는 페이지

## 📁 프로젝트 구조

```
Look-at-the-Music/
├── index.html          # 메인 애플리케이션
├── color-test.html     # 색상 추출 테스트 도구
├── js/
│   ├── config.js.example  # 설정 예제 파일
│   ├── config.js          # 실제 설정 파일 (생성 필요)
│   ├── colorExtractor.js  # 대표색 추출 유틸리티
│   └── main.js            # 메인 애플리케이션 로직
└── styles/
    └── main.css           # 스타일시트
```

## 🧠 개선 계획

- 플레이리스트 기능 추가
- 사용자 계정 및 즐겨찾기 기능
- 음악 장르별 추천 시스템

## 🔑 API 키 발급 방법

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 새 프로젝트를 생성합니다.
3. 좌측 메뉴의 'API 및 서비스' > 'API 라이브러리'로 이동합니다.
4. 'YouTube Data API v3'를 검색하여 활성화합니다.
5. '사용자 인증 정보' 탭에서 'API 키 만들기'를 클릭합니다.
6. 생성된 API 키를 config.js 파일에 입력합니다.

## 📝 라이선스

MIT 라이선스로 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
