# Look at the Music 개발 과정

이 문서는 "Look at the Music" 프로젝트의 개발 과정과 주요 결정 사항들을 기록한 것입니다.

## 1. 초기 구현 - 음악 플레이어 기본 기능

### 기본 아키텍처 설정
- HTML/CSS/JS 구조 설정
- 반응형 디자인 적용
- 기본 UI 구성 (플레이어, 컨트롤, 검색 등)

### YouTube API 연동
- YouTube Data API v3 통합
- 검색 기능 구현
- 동영상 재생 기능 구현

### 문제점 및 해결
- CORS 이슈: YouTube IFrame API 사용 시 origin 설정 필요
- 사용자 상호작용: 자동 재생 정책으로 인해 사용자 상호작용 후에만 자동 재생 가능
- 큐 시스템 구현: 플레이어가 준비되기 전 요청된 비디오를 큐에 저장

## 2. 대표색 추출 기능 구현

### 문제 정의
- 썸네일에서 대표색을 추출하여 UI에 적용하는 기능 필요
- 시각적 일관성을 위해 앨범 아트와 UI 컬러 스키마 연동 필요

### 구현 방법
1. Canvas API 사용하여 이미지 픽셀 데이터 분석
2. 색상 양자화 알고리즘 적용하여 유사한 색상 그룹화
3. 가장 자주 등장하는 색상 추출
4. 텍스트 가독성을 위한 대비 계산 알고리즘 구현

### 구현 과정
1. `ColorExtractor` 클래스 생성:
   - `extractDominantColor` 함수: 이미지 URL에서 대표색 추출
   - `_processImage` 함수: 픽셀 데이터 분석 및 색상 추출
   - `getTextColorForBackground` 함수: 배경색에 적합한 텍스트 색상 계산

2. 세부 알고리즘:
   ```javascript
   // 색상 양자화 (유사한 색상 통합)
   const quantizedR = Math.floor(r / 16) * 16;
   const quantizedG = Math.floor(g / 16) * 16;
   const quantizedB = Math.floor(b / 16) * 16;
   
   // 밝기 기반 필터링
   const brightness = (r * 299 + g * 587 + b * 114) / 1000;
   if (brightness > 240 || brightness < 10) continue;
   ```

### 발생한 문제와 해결 방법
- CORS 이슈:
  - 문제: 크로스 도메인 정책으로 이미지 로드 실패
  - 해결: crossOrigin 속성 및 오류 처리 개선, 이미지 캐시 관련 코드 추가
  
- 부정확한 색상 추출:
  - 문제: 극단적인 색상 값(검정, 흰색)이 지나치게 추출됨
  - 해결: 밝기 기반 필터링 및 임계값 도입으로 유의미한 색상 추출
  
- 성능 문제:
  - 문제: 고해상도 이미지에서 모든 픽셀 처리 시 성능 저하
  - 해결: 샘플링 크기 조정(기본값 30x30)으로 성능과 정확도 균형

## 3. 테스트 도구 개발

### color-test.html 개발
- 이미지 URL을 입력하여 대표색 추출 테스트
- 시각적 결과 확인 및 디버깅 로그 제공
- 샘플 크기 조정 옵션 제공

### 디버깅 기능 강화
- 콘솔 로그 가로채기 및 UI에 표시
- 오류 메시지 색상 구분
- 프로세스 단계별 로그 추가

## 4. 보안 및 설정 관리

### API 키 관리
- config.js 파일로 API 키 분리
- .gitignore에 config.js 추가하여 Git에서 제외
- config.js.example 파일 제공하여 설정 방법 안내

### 오류 처리 개선
- API 키 없음 감지 및 경고
- 개발 모드와 프로덕션 모드 구분
- 다양한 오류 상황에 대한 대체 UI 제공

## 5. 미래 개발 계획

### 계획된 기능
- 플레이리스트 관리 기능
- 사용자 설정 저장 (로컬 스토리지 활용)
- 다크 모드/라이트 모드 지원
- 키보드 단축키 지원

### 성능 최적화 방향
- 이미지 캐싱 개선
- 서비스 워커를 활용한 오프라인 지원
- 코드 스플리팅

## 기술 스택

- **프론트엔드**: HTML5, CSS3, 순수 JavaScript (프레임워크 없음)
- **APIs**: YouTube Data API v3, YouTube IFrame Player API
- **그래픽 처리**: Canvas API
- **기타**: Web Audio API (음원 분석 예정) 