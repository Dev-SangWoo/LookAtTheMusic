# Look at the Music

음악 감상과 함께 시각적인 요소를 제공하는 웹 기반 음악 플레이어입니다. YouTube 음악 동영상을 검색하고 재생하며, 썸네일에서 대표색을 추출하여 UI에 적용합니다.

## 주요 기능

- YouTube 음악 검색 및 재생
- 앨범 아트 썸네일에서 대표색 추출
- 대표색을 활용한 시각적 UI 경험 제공
- 집중 모드 지원
- 반응형 디자인

## 설치 및 설정

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
       // ... 다른 설정들 ...
   };
   ```

4. YouTube API 키 발급 받기:
   - [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
   - 새 프로젝트를 생성합니다.
   - YouTube Data API v3를 활성화합니다.
   - API 키를 생성합니다.
   - 자세한 내용은 [YouTube API 문서](https://developers.google.com/youtube/v3/getting-started)를 참고하세요.

5. 웹 서버를 이용해 실행하세요. 예를 들어 Python을 사용하는 경우:
   ```bash
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```

6. 브라우저에서 `http://localhost:8000`으로 접속합니다.

## 개발 도구

색상 추출 기능을 테스트하기 위한 별도의 도구가 포함되어 있습니다:

- `color-test.html`: 이미지 URL을 입력하여 대표색을 추출하고 테스트할 수 있는 페이지

## 프로젝트 구조

```
Look-at-the-Music/
├── index.html          # 메인 애플리케이션
├── color-test.html     # 색상 추출 테스트 도구
├── js/
│   ├── config.js.example  # 설정 예제 파일
│   ├── colorExtractor.js  # 대표색 추출 유틸리티
│   └── main.js            # 메인 애플리케이션 로직
└── styles/
    └── main.css           # 스타일시트
```

## 기여 방법

기여는 환영합니다! 다음 절차를 따라주세요:

1. 이 저장소를 포크합니다.
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`).
4. 브랜치를 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.

## 라이선스

MIT 라이선스에 따라 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 감사의 말

- YouTube Data API를 제공해 주는 Google에 감사드립니다.
- 이미지 분석을 위한 HTML5 Canvas API.
- 영감을 주신 모든 분들께 감사드립니다. 