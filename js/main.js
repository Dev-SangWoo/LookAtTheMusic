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

// 썸네일 URL 확인 및 조회 함수 개선 (여백 없는 16:9 비율 썸네일 우선)
async function getBestThumbnailUrl(videoId) {
    console.log('썸네일 조회 시작:', videoId);
    
    if (!videoId) return null;
    
    // 썸네일 URL 후보들 (우선순위 순)
    const candidates = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 1280x720 (16:9, 최고화질)
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // 320x180 (16:9, 중간화질)
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`      // 480x360 (4:3, 검은색 여백 있음)
    ];
    
    // 각 URL을 순서대로 시도하여 사용 가능한 첫 번째 URL 반환
    for (const url of candidates) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                console.log('사용 가능한 썸네일 발견:', url);
                return url;
            }
        } catch (error) {
            console.log(`썸네일 조회 실패 (계속 진행): ${url}`, error);
        }
    }
    
    // 모든 URL이 실패한 경우 기본 URL 반환
    console.log('모든 썸네일 URL이 실패하여 기본 URL 사용');
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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
    
    // 비디오 ID 추출
    let videoId = '';
    if (snippet.resourceId && snippet.resourceId.videoId) {
        videoId = snippet.resourceId.videoId;
    } else if (currentVideoId) {
        videoId = currentVideoId;
    }
    
    // 썸네일 URL 확인 (기존 방식을 백업으로 유지)
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
    
    // 가능한 경우 여백이 없는 16:9 비율 썸네일을 시도
    if (videoId) {
        getBestThumbnailUrl(videoId).then(betterThumbnail => {
            if (betterThumbnail) {
                // 여백 없는 고품질 썸네일이 있으면 사용
                albumArt.src = betterThumbnail;
                console.log('개선된 썸네일 사용:', betterThumbnail);
                
                // 색상 추출은 고품질 썸네일에서 수행
                extractDominantColor(betterThumbnail, albumArt, colorSample, colorCode);
            } else {
                // 개선된 썸네일을 가져오지 못한 경우 기존 썸네일 사용
                albumArt.src = thumbnailUrl;
                console.log('기존 썸네일 사용:', thumbnailUrl);
                
                // 색상 추출
                extractDominantColor(thumbnailUrl, albumArt, colorSample, colorCode);
            }
        }).catch(error => {
            // 오류 발생 시 기존 썸네일 사용
            console.error('개선된 썸네일 가져오기 실패:', error);
            albumArt.src = thumbnailUrl;
            
            // 색상 추출
            extractDominantColor(thumbnailUrl, albumArt, colorSample, colorCode);
        });
    } else {
        // 비디오 ID를 추출할 수 없는 경우 기존 썸네일 사용
        albumArt.src = thumbnailUrl;
        
        // 색상 추출
        extractDominantColor(thumbnailUrl, albumArt, colorSample, colorCode);
    }
    
    // 검색 결과 축소 (선택사항)
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.maxHeight = '150px';
    }
}

// 색상 추출 로직을 별도 함수로 분리
function extractDominantColor(thumbnailUrl, albumArt, colorSample, colorCode) {
    try {
        // 샘플 크기를 크게 설정하여 정확도 대폭 향상 (처리 시간은 증가)
        ColorExtractor.extractDominantColor(thumbnailUrl, (dominantColor) => {
            console.log('추출된 대표색:', dominantColor);
            
            // 대표색 표시
            if (colorSample) {
                colorSample.style.backgroundColor = dominantColor;
            }
            
            if (colorCode) {
                colorCode.textContent = dominantColor;
                
                // 배경색에 맞춰 텍스트 색상 변경
                const textColor = ColorExtractor.getTextColorForBackground(dominantColor);
                colorCode.style.color = textColor;
            }
            
            // 앨범 아트 테두리 색상 변경
            if (albumArt) {
                const albumArtContainer = document.querySelector('.album-art-container');
                if (albumArtContainer) {
                    albumArtContainer.style.boxShadow = `0 4px 20px ${dominantColor}80`; // 알파값 추가
                }
            }
        }, 100); // 샘플 크기 대폭 증가 (30 -> 100)
    } catch (error) {
        console.error('대표색 추출 과정에서 오류 발생:', error);
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
    
    // 현재 추출된 대표색 가져오기
    const colorSample = document.querySelector('.color-sample');
    const mainSection = document.querySelector('main');
    
    if (colorSample && colorSample.style.backgroundColor && mainSection) {
        // 배경색을 직접 main 요소에 적용 (70% 불투명도)
        let bgColor = colorSample.style.backgroundColor;
        // rgba 형식이면 불투명도 조정, #hex 형식이면 변환
        if (bgColor.startsWith('rgb')) {
            if (bgColor.startsWith('rgba')) {
                // 이미 알파값이 있으면 그냥 사용
                mainSection.style.background = bgColor;
            } else {
                // rgb에서 rgba로 변환하여 70% 불투명도 적용
                bgColor = bgColor.replace('rgb', 'rgba').replace(')', ', 0.7)');
                mainSection.style.background = bgColor;
            }
        } else {
            // hex 형식이면 그냥 사용하고 나중에 CSS에서 불투명도 조정
            mainSection.style.background = bgColor;
        }
    }
    
    // 전체 화면 모드 진입
    try {
        // 브라우저별 전체 화면 API 호출
        const docEl = document.documentElement;
        
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) { // Safari
            docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) { // IE11
            docEl.msRequestFullscreen();
        }
        
        console.log('전체 화면 모드 시작');
    } catch (error) {
        console.error('전체 화면 모드 진입 중 오류:', error);
    }
    
    // 아무 곳이나 클릭하면 해제
    setTimeout(() => { // setTimeout으로 버튼 클릭 이벤트와 겹치지 않게
        document.addEventListener('click', exitFocusModeHandler);
    }, 10);
    
    // ESC 키로 전체 화면이 종료될 때 집중 모드도 같이 종료되도록
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

// 전체 화면 변경 이벤트 핸들러
function handleFullscreenChange() {
    // 전체 화면 상태 확인
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        
        // 전체 화면이 종료되었다면 집중 모드도 종료
        if (document.body.classList.contains('focus-mode')) {
            exitFocusModeHandler({ preventFullscreenExit: true });
        }
    }
}

// 집중 모드 해제 함수
function exitFocusModeHandler(e) {
    document.body.classList.remove('focus-mode');
    
    // main 요소의 배경색 초기화
    const mainSection = document.querySelector('main');
    if (mainSection) {
        mainSection.style.background = '';
    }
    
    // 전체 화면 종료 (이미 종료되지 않았다면)
    if (!e || !e.preventFullscreenExit) {
        try {
            if (document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement || 
                document.msFullscreenElement) {
                
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                
                console.log('전체 화면 모드 종료');
            }
        } catch (error) {
            console.error('전체 화면 종료 중 오류:', error);
        }
    }
    
    // 이벤트 리스너 제거
    document.removeEventListener('click', exitFocusModeHandler);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
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
            e.preventDefault(); // 링크의 기본 동작 방지
            e.stopPropagation(); // 버튼 클릭이 바로 해제 이벤트로 전달되지 않게
            enterFocusMode();
        };
    }
}); 