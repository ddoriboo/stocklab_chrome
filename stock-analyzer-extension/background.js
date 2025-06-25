// 서버 설정
let SERVER_URL = 'http://localhost:3000'; // 기본값: 로컬 서버
let OPENAI_API_KEY = ''; // OpenAI API 키 (storage에서 로드)

// 설정 로드
chrome.storage.local.get(['serverUrl', 'openaiApiKey'], (result) => {
  if (result.serverUrl) {
    SERVER_URL = result.serverUrl;
  }
  if (result.openaiApiKey) {
    OPENAI_API_KEY = result.openaiApiKey;
  }
});


// 서버 상태 확인
let serverStatus = false;

async function checkServerStatus() {
  try {
    const response = await fetch(`${SERVER_URL}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) 
    });
    serverStatus = response.ok;
  } catch {
    serverStatus = false;
  }
  
  // 아이콘 업데이트 (아이콘 파일이 있을 때만 사용)
  // chrome.action.setIcon({ ... });
}

// 주기적으로 서버 상태 확인
setInterval(checkServerStatus, 30000); // 30초마다
checkServerStatus(); // 초기 확인

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeStock') {
    analyzeStock(request.stock, request.ticker)
      .then(analysis => sendResponse({ analysis }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // 비동기 응답
  } else if (request.action === 'updateApiKey') {
    OPENAI_API_KEY = request.apiKey;
  } else if (request.action === 'updateServerUrl') {
    SERVER_URL = request.serverUrl;
    checkServerStatus();
  } else if (request.action === 'askFollowUp') {
    askFollowUpQuestion(request.stock, request.question)
      .then(answer => sendResponse({ answer }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // 비동기 응답
  }
});

// 주식 분석 함수
async function analyzeStock(stockName, ticker) {
  try {
    // 1. MCP 서버에서 주식 데이터 가져오기
    const stockData = await fetchStockData(ticker);
    
    // 2. OpenAI API로 분석
    const aiAnalysis = await getAIAnalysis(stockName, stockData);
    
    // 3. 결과 조합
    return {
      stockName: stockName,
      ticker: ticker,
      currentPrice: stockData.ohlcv?.close || 'N/A',
      change: stockData.ohlcv?.changePercent || 'N/A',
      marketCap: formatMarketCap(stockData.marketCap),
      per: stockData.fundamental?.per || 'N/A',
      pbr: stockData.fundamental?.pbr || 'N/A',
      aiInsight: aiAnalysis
    };
  } catch (error) {
    console.error('Stock analysis error:', error);
    throw error;
  }
}

// 서버를 통해 주식 데이터 가져오기
async function fetchStockData(ticker) {
  try {
    const response = await fetch(`${SERVER_URL}/api/stock/${ticker}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    
    const data = await response.json();
    
    // 데이터 구조 정리
    return {
      ohlcv: data.ohlcv?.data?.[0] || { close: 75000, changePercent: 2.5 },
      marketCap: data.marketCap?.data?.[0]?.market_cap || 450000000000000,
      fundamental: data.fundamental?.data?.[0] || { per: 15.2, pbr: 1.8 }
    };
  } catch (error) {
    console.error('Bridge server error:', error);
    // 더미 데이터 반환 (개발용)
    return {
      ohlcv: { close: 75000, changePercent: 2.5 },
      marketCap: 450000000000000,
      fundamental: { per: 15.2, pbr: 1.8 }
    };
  }
}

// OpenAI API로 분석 (서버 프록시 사용)
async function getAIAnalysis(stockName, stockData) {
  try {
    const response = await fetch(`${SERVER_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stockName,
        stockData,
        apiKey: OPENAI_API_KEY
      })
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Analysis error:', error);
    return '분석 중 오류가 발생했습니다.';
  }
}

// 후속 질문 처리
async function askFollowUpQuestion(stockName, question) {
  try {
    const response = await fetch(`${SERVER_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stockName,
        stockData: {},
        apiKey: OPENAI_API_KEY,
        question: question
      })
    });
    
    if (!response.ok) {
      throw new Error('Follow-up question failed');
    }
    
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Follow-up question error:', error);
    throw error;
  }
}

// 시가총액 포맷팅
function formatMarketCap(value) {
  if (!value) return 'N/A';
  
  const trillion = 1000000000000;
  const billion = 1000000000;
  
  if (value >= trillion) {
    return `${(value / trillion).toFixed(1)}조원`;
  } else if (value >= billion) {
    return `${(value / billion).toFixed(0)}억원`;
  }
  return `${value}원`;
}