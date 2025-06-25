// 주식 관련 키워드 패턴 및 매핑
const STOCK_KEYWORDS = {
  '삼성전자': '005930',
  'SK하이닉스': '000660',
  'NAVER': '035420',
  '네이버': '035420',
  '카카오': '035720',
  '현대차': '005380',
  '현대자동차': '005380',
  'LG화학': '051910',
  'LG전자': '066570',
  '셀트리온': '068270',
  'SK텔레콤': '017670',
  '현대모비스': '012330',
  '삼성SDI': '006400',
  'POSCO': '005490'
};

// 6자리 코드 패턴 추가
const CODE_PATTERN = /\b[0-9]{6}\b/g;

class StockAnalyzer {
  constructor() {
    this.isInitialized = false;
    this.floatingIcon = null;
    this.nudgePopup = null;
    this.analysisModal = null;
    this.detectedStocks = new Set();
    this.scanInterval = null;
    this.currentStock = null;
  }

  init() {
    if (this.isInitialized) return;
    
    console.log('🔍 Stock Analyzer: Initializing...');
    this.createFloatingIcon();
    this.startScanning();
    this.isInitialized = true;
  }

  // 플로팅 아이콘 생성
  createFloatingIcon() {
    this.floatingIcon = document.createElement('div');
    this.floatingIcon.className = 'stock-floating-icon';
    this.floatingIcon.innerHTML = `
      <img src="${chrome.runtime.getURL('floating-icon.gif')}" alt="Stock Analyzer" />
      <div class="floating-pulse"></div>
    `;
    
    this.floatingIcon.addEventListener('click', () => {
      this.showMainMenu();
    });
    
    document.body.appendChild(this.floatingIcon);
  }

  // 텍스트 스캐닝 시작
  startScanning() {
    // 초기 스캔
    this.scanForStocks();
    
    // 3초마다 새로운 내용 스캔
    this.scanInterval = setInterval(() => {
      this.scanForStocks();
    }, 3000);
    
    // DOM 변경 감지
    const observer = new MutationObserver(() => {
      setTimeout(() => this.scanForStocks(), 1000);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 주식 키워드 스캔
  scanForStocks() {
    const textContent = document.body.innerText;
    const foundStocks = [];
    
    // 종목명 검색
    Object.keys(STOCK_KEYWORDS).forEach(stockName => {
      if (textContent.includes(stockName) && !this.detectedStocks.has(stockName)) {
        foundStocks.push({
          name: stockName,
          code: STOCK_KEYWORDS[stockName],
          type: 'name'
        });
        this.detectedStocks.add(stockName);
      }
    });
    
    // 6자리 코드 검색
    const codeMatches = textContent.match(CODE_PATTERN);
    if (codeMatches) {
      codeMatches.forEach(code => {
        if (!this.detectedStocks.has(code)) {
          const stockName = Object.keys(STOCK_KEYWORDS).find(key => STOCK_KEYWORDS[key] === code);
          foundStocks.push({
            name: stockName || `종목코드 ${code}`,
            code: code,
            type: 'code'
          });
          this.detectedStocks.add(code);
        }
      });
    }
    
    // 새로 발견된 종목이 있으면 넛지 표시
    if (foundStocks.length > 0) {
      this.showNudgePopup(foundStocks[0]); // 첫 번째 종목만 표시
    }
  }

  // 넛지 팝업 표시
  showNudgePopup(stock) {
    // 기존 넛지 제거
    if (this.nudgePopup) {
      this.nudgePopup.remove();
    }
    
    this.currentStock = stock;
    this.nudgePopup = document.createElement('div');
    this.nudgePopup.className = 'stock-nudge-popup';
    this.nudgePopup.innerHTML = `
      <div class="nudge-content">
        <div class="nudge-icon">📈</div>
        <div class="nudge-text">
          <div class="nudge-title">${stock.name}</div>
          <div class="nudge-subtitle">AI 분석 받으시겠어요?</div>
        </div>
        <div class="nudge-actions">
          <button class="nudge-btn nudge-analyze">분석</button>
          <button class="nudge-btn nudge-close">×</button>
        </div>
      </div>
    `;
    
    // 이벤트 리스너
    this.nudgePopup.querySelector('.nudge-analyze').addEventListener('click', () => {
      this.analyzeStock(stock);
      this.nudgePopup.remove();
    });
    
    this.nudgePopup.querySelector('.nudge-close').addEventListener('click', () => {
      this.nudgePopup.remove();
    });
    
    document.body.appendChild(this.nudgePopup);
    
    // 자동 사라짐 (15초 후)
    setTimeout(() => {
      if (this.nudgePopup) {
        this.nudgePopup.remove();
      }
    }, 15000);
    
    // 플로팅 아이콘에 알림 표시
    this.floatingIcon.classList.add('has-notification');
  }

  // 주식 분석 실행
  async analyzeStock(stock) {
    this.showAnalysisModal(stock, { loading: true });
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeStock',
        stock: stock.name,
        ticker: stock.code
      });
      
      if (response.analysis) {
        this.showAnalysisModal(stock, { analysis: response.analysis });
      } else {
        throw new Error(response.error || '분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      this.showAnalysisModal(stock, { error: error.message });
    }
  }

  // 분석 결과 모달
  showAnalysisModal(stock, data) {
    // 기존 모달 제거
    if (this.analysisModal) {
      this.analysisModal.remove();
    }
    
    this.analysisModal = document.createElement('div');
    this.analysisModal.className = 'stock-analysis-modal';
    
    if (data.loading) {
      this.analysisModal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content loading">
          <div class="loading-spinner"></div>
          <h3>${stock.name} 분석 중...</h3>
          <p>AI가 최신 데이터를 분석하고 있습니다.</p>
        </div>
      `;
    } else if (data.error) {
      this.analysisModal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content error">
          <div class="modal-header">
            <h3>분석 오류</h3>
            <button class="close-btn">×</button>
          </div>
          <div class="error-message">
            <p>${data.error}</p>
            <button class="retry-btn">다시 시도</button>
          </div>
        </div>
      `;
    } else {
      this.analysisModal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>${stock.name} (${stock.code})</h3>
            <button class="close-btn">×</button>
          </div>
          <div class="analysis-result">
            <div class="stock-info">
              <div class="stock-price">
                <span class="price">${data.analysis.currentPrice}원</span>
                <span class="change ${data.analysis.change >= 0 ? 'positive' : 'negative'}">
                  ${data.analysis.change >= 0 ? '+' : ''}${data.analysis.change}%
                </span>
              </div>
              <div class="stock-metrics">
                <div class="metric">
                  <span class="label">시가총액</span>
                  <span class="value">${data.analysis.marketCap}</span>
                </div>
                <div class="metric">
                  <span class="label">PER</span>
                  <span class="value">${data.analysis.per}</span>
                </div>
                <div class="metric">
                  <span class="label">PBR</span>
                  <span class="value">${data.analysis.pbr}</span>
                </div>
              </div>
            </div>
            <div class="ai-analysis">
              <h4>🤖 AI 투자 인사이트</h4>
              <p>${data.analysis.aiInsight}</p>
            </div>
            <div class="follow-up-questions">
              <h4>💬 더 알아보기</h4>
              <div class="question-bubbles">
                <button class="bubble-btn" data-question="risk">위험 요소는?</button>
                <button class="bubble-btn" data-question="comparison">동종업계 비교</button>
                <button class="bubble-btn" data-question="future">향후 전망</button>
                <button class="bubble-btn" data-question="dividend">배당 정보</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(this.analysisModal);
    
    // 이벤트 리스너 추가
    this.setupModalEvents(stock);
  }

  // 모달 이벤트 설정
  setupModalEvents(stock) {
    const modal = this.analysisModal;
    
    // 닫기 버튼
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
    }
    
    // 오버레이 클릭시 닫기
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        modal.remove();
      });
    }
    
    // 재시도 버튼
    const retryBtn = modal.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.analyzeStock(stock);
      });
    }
    
    // 후속 질문 버블 버튼
    const bubbleBtns = modal.querySelectorAll('.bubble-btn');
    bubbleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleFollowUpQuestion(stock, btn.dataset.question);
      });
    });
  }

  // 후속 질문 처리
  async handleFollowUpQuestion(stock, questionType) {
    const questions = {
      risk: `${stock.name}의 주요 위험 요소와 리스크는 무엇인가요?`,
      comparison: `${stock.name}과 동종업계 다른 기업들과 비교했을 때 어떤가요?`,
      future: `${stock.name}의 향후 3-6개월 전망은 어떻게 보시나요?`,
      dividend: `${stock.name}의 배당 정책과 배당 수익률은 어떤가요?`
    };
    
    const question = questions[questionType];
    
    // 로딩 표시
    const aiSection = this.analysisModal.querySelector('.ai-analysis');
    const originalContent = aiSection.innerHTML;
    aiSection.innerHTML = `
      <h4>🤖 AI 분석 중...</h4>
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'askFollowUp',
        stock: stock.name,
        question: question
      });
      
      if (response.answer) {
        aiSection.innerHTML = `
          <h4>🤖 AI 답변</h4>
          <p><strong>Q: </strong>${question}</p>
          <p><strong>A: </strong>${response.answer}</p>
        `;
      } else {
        throw new Error('답변을 받을 수 없습니다.');
      }
    } catch (error) {
      aiSection.innerHTML = originalContent;
      alert('후속 질문 처리 중 오류가 발생했습니다.');
    }
  }

  // 메인 메뉴 표시
  showMainMenu() {
    const menu = document.createElement('div');
    menu.className = 'stock-main-menu';
    menu.innerHTML = `
      <div class="menu-content">
        <h3>📈 Stock Analyzer</h3>
        <div class="menu-options">
          <button class="menu-btn scan-btn">💡 새로 스캔</button>
          <button class="menu-btn history-btn">📊 분석 기록</button>
          <button class="menu-btn settings-btn">⚙️ 설정</button>
        </div>
        <button class="menu-close">×</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    // 이벤트 설정
    menu.querySelector('.scan-btn').addEventListener('click', () => {
      this.detectedStocks.clear();
      this.scanForStocks();
      menu.remove();
    });
    
    menu.querySelector('.settings-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openSettings' });
      menu.remove();
    });
    
    menu.querySelector('.menu-close').addEventListener('click', () => {
      menu.remove();
    });
    
    // 자동 닫기
    setTimeout(() => {
      if (menu.parentNode) {
        menu.remove();
      }
    }, 10000);
  }
}

// 초기화
let stockAnalyzer;

function initialize() {
  if (document.body && !stockAnalyzer) {
    stockAnalyzer = new StockAnalyzer();
    stockAnalyzer.init();
  }
}

// DOM 로드 완료 후 실행
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initialize, 100);
} else {
  document.addEventListener('DOMContentLoaded', initialize);
}