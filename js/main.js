// YouTube API 설정 - config.js에서 가져옴
const API_KEY = (typeof CONFIG !== 'undefined' && CONFIG.YOUTUBE_API_KEY) ? 
                CONFIG.YOUTUBE_API_KEY : DEFAULT_CONFIG.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = (typeof CONFIG !== 'undefined' && CONFIG.YOUTUBE_API_URL) ? 
                CONFIG.YOUTUBE_API_URL : DEFAULT_CONFIG.YOUTUBE_API_URL;
const IS_DEVELOPMENT = (typeof CONFIG !== 'undefined' && typeof CONFIG.IS_DEVELOPMENT !== 'undefined') ? 
                CONFIG.IS_DEVELOPMENT : DEFAULT_CONFIG.IS_DEVELOPMENT;

// 개발 모드에서 설정 확인 로그
if (IS_DEVELOPMENT) {
    console.log('개발 모드로 실행 중');
    if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        console.warn('YouTube API 키가 설정되지 않았습니다. config.js 파일을 확인하세요.');
    }
}

// 전역 변수
let player = null;
let currentVideoId = '';
let isPlayerReady = false;
let playerQueue = [];

// YouTube IFrame API 로드
function loadYouTubeAPI() {
    console.log('YouTube API 로드 시작');
    
    // YouTube API가 이미 로드되었는지 확인
    if (window.YT) {
        console.log('YouTube API가 이미 로드되어 있습니다');
        initPlayer();
        return;
    }
    
    // onYouTubeIframeAPIReady 함수 설정
    window.onYouTubeIframeAPIReady = function() {
        console.log('YouTube IFrame API 준비됨');
        initPlayer();
    };
    
    // API 스크립트 로드
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// 플레이어 초기화
function initPlayer() {
    console.log('플레이어 초기화 시작');
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'fs': 0,
            'rel': 0,
            'modestbranding': 1,
            'playsinline': 1,
            'showinfo': 0,
            'iv_load_policy': 3,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

// 플레이어 준비 완료 시
function onPlayerReady(event) {
    console.log('플레이어 준비 완료');
    isPlayerReady = true;
    
    // 대기 중인 비디오가 있으면 재생
    if (playerQueue.length > 0) {
        const { videoId, snippet } = playerQueue.shift();
        playVideoDirectly(videoId, snippet);
    }
    
    // 플레이어 UI 업데이트
    updatePlayerUI();
}

// 플레이어 상태 변경 시
function onPlayerStateChange(event) {
    console.log('플레이어 상태 변경:', event.data);
    updatePlayerUI();
    
    if (event.data === YT.PlayerState.ENDED) {
        // 곡이 끝나면 다음 곡 재생 (구현 시)
        console.log('곡 재생 완료');
    }
}

// 플레이어 오류 발생 시
function onPlayerError(event) {
    console.error('플레이어 오류:', event.data);
    alert('음악 재생 중 오류가 발생했습니다. 다른 곡을 선택해주세요.');
}

// 플레이어 UI 업데이트
function updatePlayerUI() {
    const playBtn = document.getElementById('play-btn');
    
    if (!isPlayerReady || !player) {
        playBtn.textContent = '재생';
        playBtn.disabled = true;
        return;
    }
    
    playBtn.disabled = false;
    
    try {
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            playBtn.textContent = '일시정지';
        } else {
            playBtn.textContent = '재생';
        }
    } catch (error) {
        console.error('플레이어 상태 확인 중 오류:', error);
        playBtn.textContent = '재생';
    }
}

// 음악 검색 함수
async function searchMusic(query) {
    try {
        const response = await fetch(
            `${YOUTUBE_API_URL}/search?part=snippet&maxResults=10&q=${query} 음악&type=video&videoCategoryId=10&key=${API_KEY}`
        );
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('음악 검색 중 오류 발생:', error);
        alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
        return [];
    }
}

// 검색 결과 표시
function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        return;
    }
    
    results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <img src="${item.snippet.thumbnails.default.url}" alt="${item.snippet.title}">
            <div class="result-info">
                <h3>${item.snippet.title}</h3>
                <p>${item.snippet.channelTitle}</p>
            </div>
        `;
        resultItem.onclick = () => {
            console.log('검색 결과 클릭:', item.id.videoId);
            playVideo(item.id.videoId, item.snippet);
        };
        searchResults.appendChild(resultItem);
    });
}

// 비디오 재생 - 플레이어 상태 체크 및 큐 관리
function playVideo(videoId, snippet) {
    console.log('비디오 재생 시도:', videoId);
    
    if (!isPlayerReady) {
        console.log('플레이어가 준비되지 않았습니다. 큐에 추가합니다.');
        playerQueue.push({ videoId, snippet });
        return;
    }
    
    playVideoDirectly(videoId, snippet);
}

// 직접 비디오 재생 - 플레이어가 준비된 상태에서만 호출
function playVideoDirectly(videoId, snippet) {
    try {
        currentVideoId = videoId;
        player.loadVideoById({
            videoId: videoId,
            startSeconds: 0,
            suggestedQuality: 'small'
        });
        player.playVideo();
        updateNowPlaying(snippet);
        updatePlayerUI();
    } catch (error) {
        console.error('비디오 재생 중 오류 발생:', error);
        alert('음악 재생 중 오류가 발생했습니다.');
    }
}

// 현재 재생 중인 곡 정보 업데이트
function updateNowPlaying(snippet) {
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    const albumArt = document.querySelector('.album-art');
    const colorSample = document.querySelector('.color-sample');
    const colorCode = document.querySelector('.color-code');
    
    trackTitle.textContent = snippet.title;
    trackArtist.textContent = snippet.channelTitle;
    
    // 썸네일 URL 확인
    let thumbnailUrl = '';
    if (snippet.thumbnails) {
        if (snippet.thumbnails.high && snippet.thumbnails.high.url) {
            thumbnailUrl = snippet.thumbnails.high.url;
        } else if (snippet.thumbnails.medium && snippet.thumbnails.medium.url) {
            thumbnailUrl = snippet.thumbnails.medium.url;
        } else if (snippet.thumbnails.default && snippet.thumbnails.default.url) {
            thumbnailUrl = snippet.thumbnails.default.url;
        }
    }
    
    if (!thumbnailUrl) {
        console.error('사용 가능한 썸네일 URL이 없습니다:', snippet);
        thumbnailUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23333"/%3E%3C/svg%3E';
    }
    
    // 앨범 아트 설정
    albumArt.style.backgroundImage = `url(${thumbnailUrl})`;
    
    // 대표색 추출 전에 테스트 실행 (선택적)
    // ColorExtractor.testColorExtraction(thumbnailUrl);
    
    // 썸네일에서 대표색 추출
    console.log('대표색 추출 시작:', thumbnailUrl);
    
    try {
        // 샘플 크기를 더 크게 설정 (정확도 향상)
        ColorExtractor.extractDominantColor(thumbnailUrl, (dominantColor) => {
            console.log('추출된 대표색:', dominantColor);
            
            // 대표색 표시
            if (colorSample) {
                colorSample.style.backgroundColor = dominantColor;
                
                // 추출된 색상을 더 명확하게 확인하기 위해 크기 증가 (선택적)
                // colorSample.style.width = '30px';
                // colorSample.style.height = '30px';
            }
            
            if (colorCode) {
                colorCode.textContent = dominantColor;
                
                // 배경색에 맞춰 텍스트 색상 변경
                const textColor = ColorExtractor.getTextColorForBackground(dominantColor);
                colorCode.style.color = textColor;
            }
            
            // 앨범 아트 테두리 색상 변경
            if (albumArt) {
                albumArt.style.borderColor = dominantColor;
                albumArt.style.boxShadow = `0 4px 20px ${dominantColor}80`; // 알파값 추가
            }
        }, 30); // 샘플 크기 증가
    } catch (error) {
        console.error('대표색 추출 과정에서 오류 발생:', error);
    }
    
    // 검색 결과 축소 (선택사항)
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.maxHeight = '150px';
    }
}

// 재생/일시정지 토글
function togglePlay() {
    if (!isPlayerReady || !player || !currentVideoId) {
        console.log('플레이어가 준비되지 않았거나 재생할 곡이 없습니다.');
        return;
    }
    
    try {
        const state = player.getPlayerState();
        
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
        
        updatePlayerUI();
    } catch (error) {
        console.error('재생/일시정지 토글 중 오류 발생:', error);
    }
}

// 집중 모드 진입 함수
function enterFocusMode() {
    document.body.classList.add('focus-mode');
    // 아무 곳이나 클릭하면 해제
    setTimeout(() => { // setTimeout으로 버튼 클릭 이벤트와 겹치지 않게
        document.addEventListener('click', exitFocusModeHandler);
    }, 10);
}

// 집중 모드 해제 함수
function exitFocusModeHandler(e) {
    document.body.classList.remove('focus-mode');
    document.removeEventListener('click', exitFocusModeHandler);
}

//---------------------------------------------------------------------------------
// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    console.log('페이지 로드 완료');
    
    // 플레이어 초기화
    loadYouTubeAPI();
    
    // 검색 기능 (검색 칸 생성)
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '음악 검색...';
    searchInput.className = 'search-input';
    searchInput.onkeyup = async (e) => { //input에 onkeyup 이벤트 가져와서 e.key로 입력 키 확인  비동기 함수 시작
        if (e.key === 'Enter') {
            const results = await searchMusic(e.target.value); //
            displaySearchResults(results);
        }
    };
    document.querySelector('.player-container').prepend(searchInput);
    
    // 검색 결과를 표시할 영역 추가
    const searchResults = document.createElement('div');
    searchResults.id = 'search-results';
    searchResults.className = 'search-results';
    document.querySelector('.player-container').appendChild(searchResults);
    
    // 플레이어 컨트롤 버튼 이벤트
    const playBtn = document.getElementById('play-btn');
    playBtn.disabled = true; // 플레이어 준비 전에는 비활성화
    playBtn.onclick = togglePlay;
    
    // 이전/다음 버튼 비활성화 (추후 구현)
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
    
    // 집중하기 버튼 이벤트
    const focusBtn = document.getElementById('focus-btn');
    if (focusBtn) {
        focusBtn.onclick = (e) => {
            e.stopPropagation(); // 버튼 클릭이 바로 해제 이벤트로 전달되지 않게
            enterFocusMode();
        };
    }
}); 