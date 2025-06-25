// 주식 관련 키워드 패턴
const stockPatterns = [
  /삼성전자/g,
  /SK하이닉스/g,
  /NAVER|네이버/g,
  /카카오/g,
  /현대차|현대자동차/g,
  /LG화학/g,
  /LG전자/g,
  /셀트리온/g,
  /\b[0-9]{6}\b/g, // 6자리 종목코드
  /코스피|KOSPI/gi,
  /코스닥|KOSDAQ/gi
];

// 티커 매핑
const tickerMap = {
  '삼성전자': '005930',
  'SK하이닉스': '000660',
  'NAVER': '035420',
  '네이버': '035420',
  '카카오': '035720',
  '현대차': '005380',
  '현대자동차': '005380',
  'LG화학': '051910',
  'LG전자': '066570',
  '셀트리온': '068270'
};

// 페이지에서 주식 키워드 찾기
function findStockKeywords() {
  const textNodes = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.nodeValue;
    if (!text || text.trim().length === 0) continue;
    
    for (const pattern of stockPatterns) {
      if (pattern.test(text)) {
        textNodes.push({
          node: node,
          text: text,
          matches: text.match(pattern)
        });
        break;
      }
    }
  }
  
  return textNodes;
}

// 주식 키워드에 하이라이트 추가
function highlightStockKeywords(nodes) {
  nodes.forEach(({ node, matches }) => {
    const parent = node.parentNode;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let text = node.nodeValue;
    
    matches.forEach(match => {
      const index = text.indexOf(match, lastIndex);
      if (index === -1) return;
      
      // 매치 전 텍스트
      if (index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex, index))
        );
      }
      
      // 하이라이트된 매치
      const span = document.createElement('span');
      span.className = 'stock-highlight';
      span.textContent = match;
      span.dataset.stock = match;
      span.dataset.ticker = tickerMap[match] || match;
      
      // 클릭 이벤트 추가
      span.addEventListener('click', handleStockClick);
      
      fragment.appendChild(span);
      lastIndex = index + match.length;
    });
    
    // 나머지 텍스트
    if (lastIndex < text.length) {
      fragment.appendChild(
        document.createTextNode(text.substring(lastIndex))
      );
    }
    
    parent.replaceChild(fragment, node);
  });
}

// 주식 클릭 처리
function handleStockClick(event) {
  event.preventDefault();
  const stock = event.target.dataset.stock;
  const ticker = event.target.dataset.ticker;
  
  // Background script에 분석 요청
  chrome.runtime.sendMessage({
    action: 'analyzeStock',
    stock: stock,
    ticker: ticker
  }, response => {
    if (response && response.analysis) {
      showAnalysisPopup(event.target, response.analysis);
    }
  });
}

// 분석 결과 팝업 표시
function showAnalysisPopup(element, analysis) {
  // 기존 팝업 제거
  const existing = document.querySelector('.stock-analysis-popup');
  if (existing) existing.remove();
  
  const popup = document.createElement('div');
  popup.className = 'stock-analysis-popup';
  popup.innerHTML = `
    <div class="popup-header">
      <h3>${analysis.stockName} (${analysis.ticker})</h3>
      <button class="close-btn">&times;</button>
    </div>
    <div class="popup-content">
      <div class="stock-data">
        <p><strong>현재가:</strong> ${analysis.currentPrice}원</p>
        <p><strong>전일대비:</strong> ${analysis.change}%</p>
        <p><strong>시가총액:</strong> ${analysis.marketCap}</p>
        <p><strong>PER:</strong> ${analysis.per}</p>
        <p><strong>PBR:</strong> ${analysis.pbr}</p>
      </div>
      <div class="ai-analysis">
        <h4>AI 분석</h4>
        <p>${analysis.aiInsight}</p>
      </div>
    </div>
  `;
  
  // 위치 계산
  const rect = element.getBoundingClientRect();
  popup.style.position = 'fixed';
  popup.style.top = `${rect.bottom + 10}px`;
  popup.style.left = `${rect.left}px`;
  
  document.body.appendChild(popup);
  
  // 닫기 버튼
  popup.querySelector('.close-btn').addEventListener('click', () => {
    popup.remove();
  });
  
  // 외부 클릭시 닫기
  setTimeout(() => {
    document.addEventListener('click', function closePopup(e) {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    });
  }, 100);
}

// 초기화
function init() {
  const nodes = findStockKeywords();
  highlightStockKeywords(nodes);
  
  // DOM 변경 감지
  const observer = new MutationObserver(() => {
    const newNodes = findStockKeywords();
    highlightStockKeywords(newNodes);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 페이지 로드 완료 후 실행
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}