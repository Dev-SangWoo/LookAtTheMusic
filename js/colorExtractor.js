/**
 * 이미지 썸네일에서 대표색을 추출하는 유틸리티
 */

// 색상 빈도수를 기반으로 가장 많이 사용된 색상 추출
class ColorExtractor {
    /**
     * 이미지 URL에서 대표색을 추출
     * @param {string} imageUrl - 이미지 URL
     * @param {function} callback - 추출된 색상과 함께 호출할 콜백 함수
     * @param {number} [sampleSize=20] - 샘플링 크기 (낮을수록 빠르지만 정확도 감소)
     */
    static extractDominantColor(imageUrl, callback, sampleSize = 20) {
        // CORS 문제 해결을 위한 프록시 URL 사용 (필요 시)
        // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        // const corsImageUrl = proxyUrl + imageUrl;
        
        console.log('이미지 로드 시작:', imageUrl);
        
        try {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // CORS 정책 우회 시도
            
            // 이미지 로드 완료 시
            img.onload = () => {
                console.log('이미지 로드 완료');
                try {
                    const color = this._processImage(img, sampleSize);
                    console.log('처리된 대표색:', color);
                    callback(color);
                } catch (processingError) {
                    console.error('이미지 처리 중 오류:', processingError);
                    callback('#666666'); // 처리 오류 시 회색 반환
                }
            };
            
            // 이미지 로드 실패 시
            img.onerror = (error) => {
                console.error('이미지 로드 중 오류 발생:', imageUrl, error);
                // 이미지 로드 실패 시 특별한 색상 반환
                callback('#333333');
            };
            
            // img.src 설정은 항상 이벤트 핸들러 설정 후에 해야 함
            img.src = imageUrl;
            
            // 이미지가 캐시되어 즉시 로드될 경우 onload가 호출되지 않을 수 있음
            if (img.complete || img.complete === undefined) {
                console.log('이미지가 이미 캐시되어 있음');
                img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                setTimeout(() => {
                    img.src = imageUrl;
                }, 0);
            }
        } catch (error) {
            console.error('이미지 로드 시도 중 예외 발생:', error);
            callback('#000000');
        }
    }

    /**
     * 이미지를 처리하여 가장 많이 사용된 색상 추출
     * @param {HTMLImageElement} img - 이미지 요소
     * @param {number} sampleSize - 샘플링 크기
     * @returns {string} - RGB 색상 코드 (#RRGGBB 형식)
     * @private
     */
    static _processImage(img, sampleSize) {
        // 캔버스 생성
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
            console.error('Canvas 2D context를 얻을 수 없습니다.');
            return '#000000';
        }
        
        // 샘플링을 위해 이미지 크기 조정
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        
        try {
            // 이미지 그리기
            ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
            
            // 픽셀 데이터 가져오기
            const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
            console.log('픽셀 데이터 크기:', imageData.length);
            
            // 색상 맵 생성 (RGB 값 -> 발생 횟수)
            const colorMap = {};
            let totalPixels = 0;
            
            // 픽셀별로 색상 카운트
            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];
                
                // 완전히 투명한 픽셀이나 흰색/검정색 픽셀은 건너뛰기 (선택사항)
                if (a < 128) continue; // 투명한 픽셀 무시
                
                // 너무 밝거나 어두운 픽셀은 덜 중요하게 처리
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness > 240 || brightness < 10) continue; // 거의 흰색이나 검정색 무시
                
                // 색상 양자화 개선 (더 적은 범위로 그룹화)
                const quantizedR = Math.floor(r / 16) * 16;
                const quantizedG = Math.floor(g / 16) * 16;
                const quantizedB = Math.floor(b / 16) * 16;
                
                const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
                
                if (colorMap[colorKey]) {
                    colorMap[colorKey].count++;
                } else {
                    colorMap[colorKey] = {
                        count: 1,
                        r: quantizedR,
                        g: quantizedG,
                        b: quantizedB
                    };
                }
                
                totalPixels++;
            }
            
            console.log('추출된 색상 종류:', Object.keys(colorMap).length);
            console.log('처리된 총 픽셀:', totalPixels);
            
            if (totalPixels === 0) {
                console.warn('처리된 픽셀이 없습니다.');
                return '#444444';
            }
            
            // 가장 많이 발생한 색상 찾기 (최소 3% 이상 발생한 색상 중에서)
            let dominantColor = null;
            let maxCount = 0;
            const threshold = totalPixels * 0.03; // 최소 3% 이상 차지해야 함
            
            for (const colorKey in colorMap) {
                if (colorMap[colorKey].count > maxCount && colorMap[colorKey].count >= threshold) {
                    maxCount = colorMap[colorKey].count;
                    dominantColor = colorMap[colorKey];
                }
            }
            
            // 지배적인 색상이 발견되지 않았다면
            if (!dominantColor) {
                console.warn('지배적인 색상을 찾지 못했습니다. 임계값 없이 가장 많은 색상 사용');
                
                // 임계값 없이 다시 시도
                for (const colorKey in colorMap) {
                    if (colorMap[colorKey].count > maxCount) {
                        maxCount = colorMap[colorKey].count;
                        dominantColor = colorMap[colorKey];
                    }
                }
            }
            
            // RGB 값을 16진수로 변환
            if (dominantColor) {
                console.log('발견된 대표색:', dominantColor);
                return this._rgbToHex(
                    dominantColor.r,
                    dominantColor.g,
                    dominantColor.b
                );
            }
            
            return '#555555'; // 기본값
        } catch (error) {
            console.error('이미지 처리 중 오류:', error);
            return '#222222'; // 오류 시 어두운 회색 반환
        }
    }
    
    /**
     * RGB 값을 16진수 색상 코드로 변환
     * @param {number} r - 빨간색 값 (0-255)
     * @param {number} g - 초록색 값 (0-255)
     * @param {number} b - 파란색 값 (0-255)
     * @returns {string} - 16진수 색상 코드 (#RRGGBB)
     * @private
     */
    static _rgbToHex(r, g, b) {
        // 값이 0-255 범위 내에 있는지 확인
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        return '#' + 
            ('0' + r.toString(16)).slice(-2) +
            ('0' + g.toString(16)).slice(-2) +
            ('0' + b.toString(16)).slice(-2);
    }
    
    /**
     * 이미지 URL에서 대표색 추출 (Promise 기반)
     * @param {string} imageUrl - 이미지 URL
     * @param {number} [sampleSize=20] - 샘플링 크기
     * @returns {Promise<string>} - 색상 코드가 포함된 Promise
     */
    static async extractDominantColorAsync(imageUrl, sampleSize = 20) {
        return new Promise((resolve, reject) => {
            try {
                this.extractDominantColor(imageUrl, resolve, sampleSize);
            } catch (error) {
                console.error('비동기 색상 추출 중 오류:', error);
                reject(error);
            }
        });
    }
    
    /**
     * 두 색상 사이의 대비를 확인하여 텍스트 색상 결정
     * @param {string} backgroundColor - 배경색 (#RRGGBB 형식)
     * @returns {string} - 적절한 텍스트 색상 ('#ffffff' 또는 '#000000')
     */
    static getTextColorForBackground(backgroundColor) {
        try {
            // 16진수를 RGB로 변환
            const r = parseInt(backgroundColor.slice(1, 3), 16);
            const g = parseInt(backgroundColor.slice(3, 5), 16);
            const b = parseInt(backgroundColor.slice(5, 7), 16);
            
            // 휘도 계산 (YIQ 색상 공간 사용)
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            
            // 밝은 색상에는 어두운 텍스트, 어두운 색상에는 밝은 텍스트
            return brightness > 128 ? '#000000' : '#ffffff';
        } catch (error) {
            console.error('텍스트 색상 결정 중 오류:', error);
            return '#ffffff'; // 오류 시 흰색 텍스트 반환
        }
    }
    
    /**
     * 색상 추출 직접 시험용 (디버깅 목적)
     * @param {string} imageUrl - 이미지 URL
     */
    static testColorExtraction(imageUrl) {
        console.log('색상 추출 테스트 시작:', imageUrl);
        
        const testImg = new Image();
        testImg.crossOrigin = 'Anonymous';
        testImg.onload = () => {
            console.log('테스트 이미지 로드됨:', testImg.width, 'x', testImg.height);
            
            // 테스트용 임시 Canvas
            const testCanvas = document.createElement('canvas');
            document.body.appendChild(testCanvas);
            testCanvas.width = testImg.width;
            testCanvas.height = testImg.height;
            testCanvas.style.display = 'none';
            
            const testCtx = testCanvas.getContext('2d');
            testCtx.drawImage(testImg, 0, 0);
            
            // 색상 추출 시도
            try {
                const imageData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height);
                console.log('이미지 데이터 가져오기 성공:', imageData.data.length);
                document.body.removeChild(testCanvas);
            } catch (e) {
                console.error('테스트 과정에서 이미지 데이터 가져오기 실패:', e);
                document.body.removeChild(testCanvas);
            }
        };
        
        testImg.onerror = (e) => {
            console.error('테스트 이미지 로드 실패:', e);
        };
        
        testImg.src = imageUrl;
    }
} 