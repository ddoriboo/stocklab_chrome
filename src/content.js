// Prevent duplicate initialization
if (window.smartStockDetector) {
  console.log('SmartStockDetector already initialized');
} else {

// Stock Database - 직접 포함 (동적 로딩 문제 해결)
class StockDatabase {
  constructor() {
    this.stockDB = this.initializeStockDB();
    this.contextKeywords = [
      '주가', '종목', '투자', '매수', '매도', '상장', '증권', '주식',
      '시가총액', '배당', '수익률', '펀드', '코스피', '코스닥', 
      '거래량', '차트', '분석', '전망', '목표가', '기업',
      '상승', '하락', '등락', '변동', '급등', '급락',
      '리포트', '애널리스트', '투자의견', '투자자'
    ];
  }

  initializeStockDB() {
    return {
      // 대형주 (시가총액 10조 이상)
      '005930': { code: '005930', name: '삼성전자', sector: 'IT', market: 'KOSPI', cap: 'large' },
      '000660': { code: '000660', name: 'SK하이닉스', sector: 'IT', market: 'KOSPI', cap: 'large' },
      '035420': { code: '035420', name: '네이버', sector: 'IT', market: 'KOSPI', cap: 'large' },
      '207940': { code: '207940', name: '삼성바이오로직스', sector: 'bio', market: 'KOSPI', cap: 'large' },
      '005380': { code: '005380', name: '현대차', sector: 'auto', market: 'KOSPI', cap: 'large' },
      '006400': { code: '006400', name: '삼성SDI', sector: 'battery', market: 'KOSPI', cap: 'large' },
      '051910': { code: '051910', name: 'LG화학', sector: 'chemical', market: 'KOSPI', cap: 'large' },
      '373220': { code: '373220', name: 'LG에너지솔루션', sector: 'battery', market: 'KOSPI', cap: 'large' },

      // 중형주 (시가총액 1조~10조)
      '035720': { code: '035720', name: '카카오', sector: 'IT', market: 'KOSPI', cap: 'mid' },
      '000270': { code: '000270', name: '기아', sector: 'auto', market: 'KOSPI', cap: 'mid' },
      '068270': { code: '068270', name: '셀트리온', sector: 'bio', market: 'KOSPI', cap: 'mid' },
      '005490': { code: '005490', name: 'POSCO홀딩스', sector: 'steel', market: 'KOSPI', cap: 'mid' },
      '096770': { code: '096770', name: 'SK이노베이션', sector: 'energy', market: 'KOSPI', cap: 'mid' },
      '034730': { code: '034730', name: 'SK', sector: 'holding', market: 'KOSPI', cap: 'mid' },
      '017670': { code: '017670', name: 'SK텔레콤', sector: 'telecom', market: 'KOSPI', cap: 'mid' },
      '030200': { code: '030200', name: 'KT', sector: 'telecom', market: 'KOSPI', cap: 'mid' },
      '066570': { code: '066570', name: 'LG전자', sector: 'electronics', market: 'KOSPI', cap: 'mid' },
      '011200': { code: '011200', name: 'HMM', sector: 'shipping', market: 'KOSPI', cap: 'mid' },

      // IT/게임 (코스닥 포함)
      '352820': { code: '352820', name: '하이브', sector: 'entertainment', market: 'KOSPI', cap: 'mid' },
      '259960': { code: '259960', name: '크래프톤', sector: 'game', market: 'KOSPI', cap: 'mid' },
      '036570': { code: '036570', name: '엔씨소프트', sector: 'game', market: 'KOSDAQ', cap: 'mid' },
      '251270': { code: '251270', name: '넷마블', sector: 'game', market: 'KOSPI', cap: 'mid' },
      '263750': { code: '263750', name: '펄어비스', sector: 'game', market: 'KOSDAQ', cap: 'small' },
      '112040': { code: '112040', name: '위메이드', sector: 'game', market: 'KOSDAQ', cap: 'small' },
      '078340': { code: '078340', name: '컴투스', sector: 'game', market: 'KOSDAQ', cap: 'small' },
      '041510': { code: '041510', name: '에스엠', sector: 'entertainment', market: 'KOSDAQ', cap: 'small' },
      '035900': { code: '035900', name: 'JYP Ent.', sector: 'entertainment', market: 'KOSDAQ', cap: 'small' },

      // 바이오/제약
      '326030': { code: '326030', name: 'SK바이오팜', sector: 'bio', market: 'KOSPI', cap: 'mid' },
      '196170': { code: '196170', name: '알테오젠', sector: 'bio', market: 'KOSDAQ', cap: 'small' },
      '214150': { code: '214150', name: '클래시스', sector: 'bio', market: 'KOSDAQ', cap: 'small' },
      '302440': { code: '302440', name: 'SK바이오사이언스', sector: 'bio', market: 'KOSPI', cap: 'mid' },

      // 2차전지/소재
      '066970': { code: '066970', name: '엘앤에프', sector: 'battery', market: 'KOSPI', cap: 'mid' },
      '137400': { code: '137400', name: '피엔티', sector: 'battery', market: 'KOSDAQ', cap: 'small' },
      '020150': { code: '020150', name: '롯데에너지머티리얼즈', sector: 'chemical', market: 'KOSPI', cap: 'mid' },

      // 반도체/IT 부품
      '042700': { code: '042700', name: '한미반도체', sector: 'semiconductor', market: 'KOSDAQ', cap: 'small' },
      '039030': { code: '039030', name: '이오테크닉스', sector: 'semiconductor', market: 'KOSDAQ', cap: 'small' },
      '095340': { code: '095340', name: 'ISC', sector: 'semiconductor', market: 'KOSDAQ', cap: 'small' },

      // 금융
      '055550': { code: '055550', name: '신한지주', sector: 'finance', market: 'KOSPI', cap: 'large' },
      '105560': { code: '105560', name: 'KB금융', sector: 'finance', market: 'KOSPI', cap: 'large' },
      '086790': { code: '086790', name: '하나금융지주', sector: 'finance', market: 'KOSPI', cap: 'large' },

      // 건설/부동산
      '000720': { code: '000720', name: '현대건설', sector: 'construction', market: 'KOSPI', cap: 'mid' },
      '028260': { code: '028260', name: '삼성물산', sector: 'construction', market: 'KOSPI', cap: 'mid' },

      // 유통/소비재
      '007070': { code: '007070', name: 'GS리테일', sector: 'retail', market: 'KOSPI', cap: 'mid' },
      '139480': { code: '139480', name: '이마트', sector: 'retail', market: 'KOSPI', cap: 'mid' },

      // 항공/운송
      '003490': { code: '003490', name: '대한항공', sector: 'airline', market: 'KOSPI', cap: 'mid' },
      '020560': { code: '020560', name: '아시아나항공', sector: 'airline', market: 'KOSPI', cap: 'small' },

      // 기타 주요 종목
      '015760': { code: '015760', name: '한국전력', sector: 'utility', market: 'KOSPI', cap: 'large' },
      '036460': { code: '036460', name: '한국가스공사', sector: 'utility', market: 'KOSPI', cap: 'mid' }
    };
  }

  // 종목 코드로 정보 조회
  getStockByCode(code) {
    return this.stockDB[code] || null;
  }

  // 종목명으로 정보 조회 (정확한 매칭)
  getStockByName(name) {
    const normalizedName = name.trim().toLowerCase();
    
    for (const [code, stock] of Object.entries(this.stockDB)) {
      if (stock.name.toLowerCase() === normalizedName) {
        return stock;
      }
    }
    return null;
  }

  // 부분 매칭으로 종목 검색
  searchStocksByName(query) {
    const normalizedQuery = query.trim().toLowerCase();
    const results = [];
    
    for (const [code, stock] of Object.entries(this.stockDB)) {
      if (stock.name.toLowerCase().includes(normalizedQuery)) {
        results.push(stock);
      }
    }
    
    return results.sort((a, b) => a.name.length - b.name.length); // 짧은 이름 우선
  }

  // 종목 코드 형식 검증
  isValidStockCode(code) {
    // 한국 주식 코드: 6자리 숫자
    const codePattern = /^\d{6}$/;
    return codePattern.test(code);
  }

  // 컨텍스트 분석 - 주식 관련 문맥인지 확인
  isStockContext(text, position, window = 100) {
    const startPos = Math.max(0, position - window);
    const endPos = Math.min(text.length, position + window);
    const contextText = text.substring(startPos, endPos).toLowerCase();
    
    // 주식 관련 키워드가 주변에 있는지 확인
    return this.contextKeywords.some(keyword => 
      contextText.includes(keyword.toLowerCase())
    );
  }

  // 전체 종목 목록 반환
  getAllStocks() {
    return Object.values(this.stockDB);
  }

  // 섹터별 종목 조회
  getStocksBySector(sector) {
    return Object.values(this.stockDB).filter(stock => stock.sector === sector);
  }

  // 시장별 종목 조회 (KOSPI/KOSDAQ)
  getStocksByMarket(market) {
    return Object.values(this.stockDB).filter(stock => stock.market === market);
  }

  // 시가총액별 종목 조회
  getStocksByCapSize(capSize) {
    return Object.values(this.stockDB).filter(stock => stock.cap === capSize);
  }
}

class SmartStockDetector {
  constructor() {
    this.detectionBubble = null;
    this.modal = null;
    this.currentState = 'idle'; // idle, detecting, analyzing, result
    this.sessionData = {
      detectedStocks: [],
      selectedStock: null,
      analysisResult: null,
      followUpQuestions: [],
      lastScanTime: 0,
      currentDomainStocks: [] // 현재 도메인에서 감지된 종목들
    };
    this.stockDB = null;
    this.observer = null;
    this.scanDebounceTimer = null;
    this.bubbleTimeout = null;
    this.lastPageContent = '';
    this.init();
  }

  init() {
    // 주식 데이터베이스 직접 생성
    this.stockDB = new StockDatabase();
    console.log('Smart Stock Detector initialized');
    
    if (this.shouldStartDetection()) {
      this.createFloatingButton();  // 항상 표시되는 플로팅 버튼
      this.createDetectionBubble();
      this.createModal();
      this.startRealtimeDetection();
    }
  }

  shouldStartDetection() {
    // 모든 웹사이트에서 동작하되, 특정 사이트는 제외
    const hostname = window.location.hostname;
    const excludedSites = [
      'chrome://', 'chrome-extension://', 'moz-extension://',
      'about:', 'data:', 'file:', 'javascript:'
    ];
    
    return !excludedSites.some(site => window.location.href.startsWith(site));
  }

  createFloatingButton() {
    if (document.getElementById('smart-stock-floating-btn')) {
      return;
    }

    this.floatingBtn = document.createElement('button');
    this.floatingBtn.id = 'smart-stock-floating-btn';
    this.floatingBtn.className = 'smart-floating-button';
    this.floatingBtn.innerHTML = `
      <img src="${chrome.runtime.getURL('assets/floating-icon.gif')}" alt="AI 분석기" class="floating-icon" />
    `;
    
    this.floatingBtn.addEventListener('click', () => this.toggleModal());
    document.body.appendChild(this.floatingBtn);
  }

  toggleModal() {
    if (this.modal.classList.contains('show')) {
      this.hideModal();
    } else {
      this.showModal();
    }
  }

  createDetectionBubble() {
    if (document.getElementById('smart-stock-bubble')) {
      return;
    }

    this.detectionBubble = document.createElement('div');
    this.detectionBubble.id = 'smart-stock-bubble';
    this.detectionBubble.className = 'stock-detection-bubble hidden';
    this.detectionBubble.innerHTML = `
      <div class="bubble-header">
        <div class="bubble-icon">📈</div>
        <div class="bubble-title">주식 종목 발견</div>
        <button class="bubble-close">×</button>
      </div>
      <div class="bubble-content">
        <div class="detected-stocks-list"></div>
        <div class="bubble-footer">
          <small>클릭하여 AI 분석 보기</small>
        </div>
      </div>
    `;

    // 이벤트 리스너
    const closeBtn = this.detectionBubble.querySelector('.bubble-close');
    closeBtn.addEventListener('click', () => this.hideDetectionBubble());
    
    document.body.appendChild(this.detectionBubble);
  }

  startRealtimeDetection() {
    // 초기 페이지 스캔
    this.performInitialScan();
    
    // DOM 변화 감지
    this.observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 텍스트 노드가 추가되었는지 확인
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.TEXT_NODE || 
                (node.nodeType === Node.ELEMENT_NODE && node.innerText)) {
              shouldScan = true;
              break;
            }
          }
        }
      });
      
      if (shouldScan) {
        this.debouncedScan();
      }
    });

    // DOM 변화 관찰 시작
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log('Real-time stock detection started');
  }

  performInitialScan() {
    // 페이지 로드 후 3초 대기 (동적 콘텐츠 로딩 대기)
    setTimeout(() => {
      this.scanPageForStocks();
    }, 3000);
  }

  debouncedScan() {
    // 성능 최적화: 500ms 내 추가 변경사항 있으면 스캔 지연
    clearTimeout(this.scanDebounceTimer);
    this.scanDebounceTimer = setTimeout(() => {
      this.scanPageForStocks();
    }, 500);
  }

  scanPageForStocks() {
    const now = Date.now();
    
    // 최근 5초 내에 스캔했으면 스킵 (성능 최적화)
    if (now - this.sessionData.lastScanTime < 5000) {
      return;
    }
    
    this.sessionData.lastScanTime = now;
    
    const currentContent = document.body.innerText;
    
    // 콘텐츠가 변하지 않았으면 스킵
    if (currentContent === this.lastPageContent) {
      return;
    }
    
    this.lastPageContent = currentContent;
    
    console.log('Scanning page for stocks...');
    
    const detectedStocks = this.extractStockKeywords();
    
    if (detectedStocks.length > 0) {
      console.log('Stocks detected:', detectedStocks.map(s => s.name));
      this.onStocksDetected(detectedStocks);
    }
  }

  onStocksDetected(stocks) {
    // 새로 감지된 종목만 필터링
    const newStocks = stocks.filter(stock => 
      !this.sessionData.currentDomainStocks.find(existing => existing.code === stock.code)
    );
    
    if (newStocks.length > 0) {
      this.sessionData.currentDomainStocks = [...this.sessionData.currentDomainStocks, ...newStocks];
      this.sessionData.detectedStocks = stocks;
      this.showDetectionBubble(stocks);
    }
  }

  showDetectionBubble(stocks) {
    const stocksList = this.detectionBubble.querySelector('.detected-stocks-list');
    
    const stockButtons = stocks.slice(0, 3).map(stock => {
      const confidenceColor = stock.confidence >= 0.8 ? '#4CAF50' : stock.confidence >= 0.6 ? '#FF9800' : '#757575';
      
      return `
        <button class="detected-stock-btn" data-code="${stock.code}" data-name="${stock.name}">
          <div class="stock-info">
            <span class="stock-name">${stock.name}</span>
            <span class="stock-code">(${stock.code})</span>
          </div>
          <div class="stock-meta">
            <span class="confidence" style="color: ${confidenceColor}">
              ${Math.round(stock.confidence * 100)}%
            </span>
          </div>
        </button>
      `;
    }).join('');
    
    stocksList.innerHTML = stockButtons;
    
    // 종목 선택 이벤트 리스너
    stocksList.querySelectorAll('.detected-stock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const name = btn.dataset.name;
        this.selectStockFromBubble({ code, name });
      });
    });
    
    // 버블 표시
    this.detectionBubble.classList.remove('hidden');
    this.detectionBubble.classList.add('show');
    
    // 10초 후 자동 숨김
    clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      this.hideDetectionBubble();
    }, 10000);
  }

  hideDetectionBubble() {
    this.detectionBubble.classList.remove('show');
    this.detectionBubble.classList.add('hidden');
    clearTimeout(this.bubbleTimeout);
  }

  async selectStockFromBubble(stockInfo) {
    this.hideDetectionBubble();
    this.sessionData.selectedStock = stockInfo;
    this.showModal();
    await this.selectStock(stockInfo);
  }

  createModal() {
    if (document.getElementById('naver-stock-modal')) {
      return;
    }

    this.modal = document.createElement('div');
    this.modal.id = 'naver-stock-modal';
    this.modal.className = 'stock-modal';
    this.modal.innerHTML = `
      <div class="stock-modal-content">
        <div class="stock-modal-header">
          <h2 class="stock-modal-title">주식 AI 분석</h2>
          <button class="stock-modal-close">&times;</button>
        </div>
        <div class="stock-modal-body">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>초기화 중입니다...</p>
          </div>
        </div>
      </div>
    `;

    const closeBtn = this.modal.querySelector('.stock-modal-close');
    closeBtn.addEventListener('click', () => this.hideModal());
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });

    document.body.appendChild(this.modal);
  }


  showModal() {
    this.modal.classList.add('show');
    
    // 세션 데이터가 있으면 복원, 없으면 새로 시작
    if (this.currentState === 'idle' || this.sessionData.detectedStocks.length === 0) {
      this.startStockDetection();
    } else {
      this.restoreSession();
    }
  }

  hideModal() {
    this.modal.classList.remove('show');
  }

  restoreSession() {
    switch (this.currentState) {
      case 'selecting':
        this.displayStockSelection();
        break;
      case 'result':
        this.displayAnalysisResult();
        break;
      default:
        this.startStockDetection();
    }
  }

  async startStockDetection() {
    this.currentState = 'detecting';
    const modalBody = this.modal.querySelector('.stock-modal-body');
    
    modalBody.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>페이지에서 주식 종목을 찾고 있습니다...</p>
      </div>
    `;

    try {
      const stockKeywords = this.extractStockKeywords();
      
      if (stockKeywords.length === 0) {
        modalBody.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #666;">
            <p>현재 페이지에서 주식 관련 정보를 찾을 수 없습니다.</p>
            <p style="font-size: 14px; margin-top: 10px;">직접 종목을 입력하여 분석해보세요.</p>
            <button class="question-btn" onclick="this.closest('.stock-modal-body').parentElement.parentElement.querySelector('.stock-modal-body').innerHTML = this.dataset.manualSearch" data-manual-search="<div class='manual-search'><div class='search-title'>직접 종목 검색</div><div class='search-input-group'><input type='text' class='search-input' placeholder='종목명 또는 종목코드 입력 (예: 삼성전자, 005930)'><button class='search-btn'>검색</button></div><div class='search-results'></div></div>" style="margin-top: 16px;">직접 입력하기</button>
          </div>
        `;
        
        // 직접 입력 버튼 이벤트 추가
        modalBody.querySelector('.question-btn').addEventListener('click', () => {
          this.showManualSearch();
        });
        return;
      }

      this.sessionData.detectedStocks = stockKeywords;
      this.currentState = 'selecting';
      this.displayStockSelection();

    } catch (error) {
      console.error('주식 검색 중 오류:', error);
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
          오류가 발생했습니다.<br>
          잠시 후 다시 시도해주세요.
        </div>
      `;
    }
  }

  displayStockSelection() {
    const modalBody = this.modal.querySelector('.stock-modal-body');
    const candidates = this.sessionData.detectedStocks;
    
    const candidateButtons = candidates.map(stock => {
      const confidenceColor = stock.confidence >= 0.8 ? '#4CAF50' : stock.confidence >= 0.6 ? '#FF9800' : '#757575';
      const sourceText = stock.source === 'code_pattern' ? '코드' : '종목명';
      
      return `
        <button class="stock-candidate-btn" data-code="${stock.code}" data-name="${stock.name}">
          <div class="candidate-main">
            <span class="candidate-name">${stock.name}</span>
            <span class="candidate-code">(${stock.code})</span>
          </div>
          <div class="candidate-meta">
            <span class="candidate-sector">${this.getSectorKorean(stock.sector)} • ${stock.market}</span>
            <span class="candidate-confidence" style="color: ${confidenceColor}">
              ${Math.round(stock.confidence * 100)}% • ${sourceText}
            </span>
          </div>
          <button class="reject-btn" data-code="${stock.code}" title="이 종목 제외">×</button>
        </button>
      `;
    }).join('');

    modalBody.innerHTML = `
      <div class="stock-selection">
        <div class="selection-title">분석을 원하시는 종목을 선택해주세요</div>
        <div class="selection-subtitle">
          ${candidates.length}개 종목이 발견되었습니다. 잘못된 종목은 ×를 눌러 제외하세요.
        </div>
        <div class="stock-candidates">
          ${candidateButtons}
        </div>
        <div class="selection-actions">
          <button class="refresh-btn">다시 검색</button>
          <button class="manual-search-btn">직접 입력</button>
        </div>
      </div>
    `;

    // 종목 선택 이벤트 리스너
    modalBody.querySelectorAll('.stock-candidate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // ×버튼 클릭이 아닌 경우에만 선택
        if (!e.target.classList.contains('reject-btn')) {
          const code = e.currentTarget.dataset.code;
          const name = e.currentTarget.dataset.name;
          this.selectStock({ code, name });
        }
      });
    });

    // 종목 제외 버튼 이벤트 리스너
    modalBody.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = e.target.dataset.code;
        this.rejectStock(code);
      });
    });

    // 액션 버튼 이벤트 리스너
    modalBody.querySelector('.refresh-btn').addEventListener('click', () => {
      this.startStockDetection();
    });

    modalBody.querySelector('.manual-search-btn').addEventListener('click', () => {
      this.showManualSearch();
    });
  }

  rejectStock(code) {
    const stockToReject = this.sessionData.detectedStocks.find(s => s.code === code);
    if (stockToReject) {
      // 후보군에서 제거
      this.sessionData.detectedStocks = this.sessionData.detectedStocks.filter(s => s.code !== code);
      
      // 화면 새로고침
      if (this.sessionData.detectedStocks.length > 0) {
        this.displayStockSelection();
      } else {
        // 모든 종목이 제거된 경우 다시 검색
        this.startStockDetection();
      }
    }
  }

  showManualSearch() {
    const modalBody = this.modal.querySelector('.stock-modal-body');
    
    modalBody.innerHTML = `
      <div class="manual-search">
        <div class="search-title">직접 종목 검색</div>
        <div class="search-input-group">
          <input type="text" class="search-input" placeholder="종목명 또는 종목코드 입력 (예: 삼성전자, 005930)">
          <button class="search-btn">검색</button>
        </div>
        <div class="search-results"></div>
        <div class="search-actions">
          <button class="back-btn">뒤로가기</button>
        </div>
      </div>
    `;

    const searchInput = modalBody.querySelector('.search-input');
    const searchBtn = modalBody.querySelector('.search-btn');
    const searchResults = modalBody.querySelector('.search-results');
    const backBtn = modalBody.querySelector('.back-btn');

    const performSearch = () => {
      const query = searchInput.value.trim();
      if (!query) return;

      let results = [];
      
      // 종목코드로 검색
      if (this.stockDB.isValidStockCode(query)) {
        const stock = this.stockDB.getStockByCode(query);
        if (stock) results.push(stock);
      }
      
      // 종목명으로 검색
      const nameResults = this.stockDB.searchStocksByName(query);
      results = [...results, ...nameResults];
      
      // 중복 제거
      results = results.filter((stock, index, self) => 
        index === self.findIndex(s => s.code === stock.code)
      );

      if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
      } else {
        const resultButtons = results.map(stock => `
          <button class="search-result-btn" data-code="${stock.code}" data-name="${stock.name}">
            <span class="result-name">${stock.name}</span>
            <span class="result-code">(${stock.code})</span>
            <span class="result-sector">${this.getSectorKorean(stock.sector)} • ${stock.market}</span>
          </button>
        `).join('');
        
        searchResults.innerHTML = resultButtons;
        
        // 결과 클릭 이벤트
        searchResults.querySelectorAll('.search-result-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const code = btn.dataset.code;
            const name = btn.dataset.name;
            this.selectStock({ code, name });
          });
        });
      }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });

    backBtn.addEventListener('click', () => {
      this.displayStockSelection();
    });

    // 포커스 설정
    searchInput.focus();
  }

  getSectorKorean(sector) {
    const sectorMap = {
      'IT': 'IT',
      'bio': '바이오',
      'auto': '자동차',
      'battery': '배터리',
      'chemical': '화학',
      'game': '게임',
      'entertainment': '엔터',
      'semiconductor': '반도체',
      'finance': '금융',
      'construction': '건설',
      'retail': '유통',
      'airline': '항공',
      'utility': '공기업',
      'steel': '철강',
      'energy': '에너지',
      'holding': '지주',
      'telecom': '통신',
      'electronics': '전자',
      'shipping': '해운'
    };
    return sectorMap[sector] || sector;
  }

  async selectStock(stockInfo) {
    this.sessionData.selectedStock = stockInfo;
    this.currentState = 'analyzing';
    
    const modalBody = this.modal.querySelector('.stock-modal-body');
    modalBody.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>${stockInfo.name} 데이터를 수집하고 있습니다...</p>
      </div>
    `;

    try {
      // 1. 데이터 수집
      const stockDataResponse = await chrome.runtime.sendMessage({
        action: 'fetchStockData',
        stockCode: stockInfo.code
      });

      if (!stockDataResponse.success) {
        throw new Error(stockDataResponse.error);
      }

      modalBody.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>AI가 ${stockInfo.name}를 분석하고 있습니다...</p>
        </div>
      `;

      // 2. AI 분석
      const analysisResponse = await chrome.runtime.sendMessage({
        action: 'analyzeStockWithAI',
        stockData: stockDataResponse.data
      });

      if (!analysisResponse.success) {
        if (analysisResponse.error.includes('OpenAI API 키')) {
          modalBody.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
              <p>OpenAI API 키가 설정되지 않았습니다.</p>
              <p style="font-size: 14px; margin-top: 10px;">익스텐션 아이콘을 클릭하여 API 키를 설정해주세요.</p>
            </div>
          `;
        } else {
          throw new Error(analysisResponse.error);
        }
        return;
      }

      // 3. 결과 저장 및 표시
      this.sessionData.analysisResult = {
        stockData: stockDataResponse.data,
        analysis: analysisResponse.analysis
      };
      
      this.generateFollowUpQuestions();
      this.currentState = 'result';
      this.displayAnalysisResult();

    } catch (error) {
      console.error('분석 중 오류:', error);
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
          <p>분석 중 오류가 발생했습니다.</p>
          <p style="font-size: 12px; color: #666; margin-top: 10px;">${error.message}</p>
          <button class="question-btn" onclick="location.reload()" style="margin-top: 16px;">다시 시도</button>
        </div>
      `;
    }
  }

  displayAnalysisResult() {
    const modalBody = this.modal.querySelector('.stock-modal-body');
    const { stockData, analysis } = this.sessionData.analysisResult;
    const { basic } = stockData;
    const selectedStock = this.sessionData.selectedStock;
    
    const analysisHtml = `
      <div class="stock-analysis">
        <div class="stock-header">
          <h3>${selectedStock.name} (${selectedStock.code})</h3>
          ${basic ? `
            <div class="stock-price">
              <span class="current-price">${basic.closePrice?.toLocaleString() || '정보 없음'}원</span>
              <span class="price-change ${(basic.fluctuationsRatio || 0) >= 0 ? 'positive' : 'negative'}">
                ${basic.compareToPreviousPrice || '0'} (${basic.fluctuationsRatio || '0'}%)
              </span>
            </div>
          ` : ''}
        </div>
        
        <div class="ai-analysis">
          ${this.formatAIAnalysis(analysis)}
        </div>
        
        ${this.renderFollowUpQuestions()}
        
        <div class="analysis-footer">
          <small>🤖 AI 분석 결과 • ${new Date().toLocaleString()}</small>
        </div>
      </div>
    `;
    
    modalBody.innerHTML = analysisHtml;
    this.attachFollowUpListeners();
  }

  generateFollowUpQuestions() {
    const stockName = this.sessionData.selectedStock.name;
    this.sessionData.followUpQuestions = [
      `${stockName}의 향후 3개월 전망은?`,
      `${stockName} 매수 타이밍은 언제가 좋을까요?`,
      `${stockName}와 경쟁사 비교 분석`,
      `${stockName}의 리스크 요인 분석`,
      `${stockName} 배당 정보와 수익률`,
      `다른 종목 분석하기`
    ];
  }

  renderFollowUpQuestions() {
    const questions = this.sessionData.followUpQuestions;
    const questionButtons = questions.map((question, index) => 
      `<button class="question-btn" data-question-index="${index}">${question}</button>`
    ).join('');

    return `
      <div class="follow-up-questions">
        <div class="follow-up-title">추가로 궁금한 것이 있나요?</div>
        <div class="question-buttons">
          ${questionButtons}
        </div>
      </div>
    `;
  }

  attachFollowUpListeners() {
    const modalBody = this.modal.querySelector('.stock-modal-body');
    modalBody.querySelectorAll('.question-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questionIndex = parseInt(e.target.dataset.questionIndex);
        this.handleFollowUpQuestion(questionIndex);
      });
    });
  }

  async handleFollowUpQuestion(questionIndex) {
    const question = this.sessionData.followUpQuestions[questionIndex];
    
    // "다른 종목 분석하기" 선택 시
    if (questionIndex === 5) {
      this.resetSession();
      this.startStockDetection();
      return;
    }

    const modalBody = this.modal.querySelector('.stock-modal-body');
    modalBody.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>추가 분석 중입니다...</p>
      </div>
    `;

    try {
      const followUpPrompt = this.createFollowUpPrompt(question);
      
      const analysisResponse = await chrome.runtime.sendMessage({
        action: 'analyzeStockWithAI',
        stockData: {
          ...this.sessionData.analysisResult.stockData,
          followUpQuestion: followUpPrompt
        }
      });

      if (analysisResponse.success) {
        // 기존 분석에 추가 분석 결과 추가
        this.sessionData.analysisResult.analysis += `\n\n## ${question}\n${analysisResponse.analysis}`;
        this.displayAnalysisResult();
      } else {
        throw new Error(analysisResponse.error);
      }

    } catch (error) {
      console.error('추가 분석 오류:', error);
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
          추가 분석 중 오류가 발생했습니다.<br>
          <button class="question-btn" onclick="this.parentElement.parentElement.innerHTML = this.previousAnalysis">돌아가기</button>
        </div>
      `;
    }
  }

  createFollowUpPrompt(question) {
    const stockData = this.sessionData.analysisResult.stockData;
    const stockName = this.sessionData.selectedStock.name;
    
    return `
이전 분석: ${this.sessionData.analysisResult.analysis}

추가 질문: ${question}

위 질문에 대해 ${stockName} 종목을 중심으로 구체적이고 실용적인 답변을 해주세요.
기존 분석 내용을 참고하되, 질문에 특화된 새로운 인사이트를 제공해주세요.
`;
  }

  resetSession() {
    this.currentState = 'idle';
    this.sessionData = {
      detectedStocks: [],
      selectedStock: null,
      analysisResult: null,
      followUpQuestions: [],
      lastScanTime: 0,
      currentDomainStocks: []
    };
  }

  extractStockKeywords() {
    const keywords = [];
    const text = document.body.innerText;
    
    console.log('페이지 텍스트 분석 시작...');
    
    // 1. 종목 코드 패턴 매칭 (더 정교한 검증)
    const codeResults = this.extractStockCodes(text);
    console.log('발견된 종목 코드:', codeResults);
    
    // 2. 종목명 패턴 매칭 (동적 DB 활용)
    const nameResults = this.extractStockNames(text);
    console.log('발견된 종목명:', nameResults);
    
    // 3. 결과 통합 및 중복 제거
    const allResults = [...codeResults, ...nameResults];
    const uniqueResults = [];
    
    for (const result of allResults) {
      // 중복 제거
      if (!uniqueResults.find(k => k.code === result.code)) {
        uniqueResults.push({
          ...result,
          confidence: result.confidence || 1.0,
          source: result.source || 'unknown'
        });
      }
    }
    
    // 4. 신뢰도순 정렬 및 상위 5개 선택 (버블에 표시할 수량 제한)
    const sortedResults = uniqueResults
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
    
    console.log('최종 선택된 종목들:', sortedResults);
    return sortedResults;
  }

  extractStockCodes(text) {
    const results = [];
    const stockCodePattern = /\b\d{6}\b/g;
    let match;
    
    while ((match = stockCodePattern.exec(text)) !== null) {
      const code = match[0];
      const position = match.index;
      
      // 종목 코드 형식 검증
      if (!this.stockDB.isValidStockCode(code)) {
        continue;
      }
      
      // DB에서 종목 정보 조회
      const stockInfo = this.stockDB.getStockByCode(code);
      if (!stockInfo) {
        continue;
      }
      
      // 컨텍스트 분석
      const isValidContext = this.stockDB.isStockContext(text, position);
      const confidence = isValidContext ? 0.9 : 0.3;
      
      // 신뢰도가 너무 낮으면 제외
      if (confidence < 0.5) {
        continue;
      }
      
      results.push({
        ...stockInfo,
        confidence: confidence,
        source: 'code_pattern',
        position: position
      });
    }
    
    return results;
  }

  extractStockNames(text) {
    const results = [];
    const allStocks = this.stockDB.getAllStocks();
    
    for (const stock of allStocks) {
      const namePattern = new RegExp(`\\b${this.escapeRegExp(stock.name)}\\b`, 'gi');
      let match;
      
      while ((match = namePattern.exec(text)) !== null) {
        const position = match.index;
        
        // 컨텍스트 분석
        const isValidContext = this.stockDB.isStockContext(text, position);
        const confidence = isValidContext ? 0.95 : 0.4;
        
        // 신뢰도가 너무 낮으면 제외
        if (confidence < 0.5) {
          continue;
        }
        
        results.push({
          ...stock,
          confidence: confidence,
          source: 'name_pattern',
          position: position
        });
      }
    }
    
    return results;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }


  formatAIAnalysis(analysis) {
    if (!analysis || typeof analysis !== 'string') {
      return '<div class="analysis-card"><div class="card-content"><p>분석 결과를 불러올 수 없습니다.</p></div></div>';
    }
    
    console.log('원본 분석 텍스트:', analysis);
    
    try {
      // 안전한 텍스트 처리: 기본적인 줄바꿈과 마크다운만 처리
      const cleanText = analysis
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br>');
      
      // 간단한 카드 형태로 표시
      return `
        <div class="analysis-card">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h3 class="card-title">AI 분석 결과</h3>
          </div>
          <div class="card-content">
            <p>${cleanText}</p>
          </div>
        </div>
      `;
      
    } catch (error) {
      console.error('텍스트 처리 오류:', error);
      
      // 최종 폴백: 완전히 안전한 방법
      const safeText = analysis.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `
        <div class="analysis-card">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h3 class="card-title">AI 분석 결과</h3>
          </div>
          <div class="card-content">
            <pre style="white-space: pre-wrap; font-family: inherit;">${safeText}</pre>
          </div>
        </div>
      `;
    }
  }

  simpleMarkdownToHTML(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .split('\n')
      .map(line => {
        line = line.trim();
        if (!line) return '';
        
        // 굵은 텍스트 변환
        line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // 기울임 텍스트 변환  
        line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // 코드 변환
        line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 리스트 처리
        if (line.match(/^[-•*]\s+/)) {
          return `<li>${line.replace(/^[-•*]\s+/, '')}</li>`;
        }
        
        // 번호 리스트 처리
        if (line.match(/^\d+\.\s+/)) {
          return `<li>${line.replace(/^\d+\.\s+/, '')}</li>`;
        }
        
        // 일반 텍스트
        return `<p>${line}</p>`;
      })
      .join('')
      .replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>')
      .replace(/<\/ul><ul>/g, '')
      .replace(/<p><\/p>/g, '');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getIconClass(emoji) {
    const iconMap = {
      '📊': 'icon-chart',
      '📈': 'icon-trend', 
      '📰': 'icon-news',
      '💡': 'icon-insight'
    };
    return iconMap[emoji] || 'icon-default';
  }
}

// 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartStockDetector = new SmartStockDetector();
  });
} else {
  window.smartStockDetector = new SmartStockDetector();
}

} // End of duplicate prevention block