chrome.runtime.onInstalled.addListener(() => {
  console.log('네이버 증권 재무 리포트 생성기가 설치되었습니다.');
  
  chrome.storage.sync.get(['openaiApiKey'], (storageData) => {
    if (!storageData.openaiApiKey) {
      console.log('OpenAI API 키가 설정되지 않았습니다. 설정해주세요.');
    }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip internal Chrome pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
      return;
    }
    
    try {
      // Check if content script is already injected
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => typeof window.smartStockDetector !== 'undefined'
      });
      
      if (!results[0].result) {
        // Only inject if not already present
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['src/content.js']
        });
        console.log('Smart Stock Detector injected for tab:', tabId, tab.url);
      } else {
        console.log('Smart Stock Detector already exists for tab:', tabId);
      }
    } catch (err) {
      console.log('Content script injection error:', err);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchStockData') {
    fetchStockDataFromAPI(request.stockCode)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'analyzeStockWithAI') {
    analyzeStockWithChatGPT(request.stockData)
      .then(analysis => sendResponse({ success: true, analysis }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'setApiKey') {
    chrome.storage.sync.set({ openaiApiKey: request.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getApiKey') {
    chrome.storage.sync.get(['openaiApiKey'], (keyData) => {
      sendResponse({ success: true, apiKey: keyData.openaiApiKey || '' });
    });
    return true;
  }
});

async function fetchStockDataFromAPI(stockCode) {
  try {
    console.log(`주식 데이터 조회 시작: ${stockCode}`);
    
    // 빠른 응답을 위해 가장 안정적인 API만 사용
    const stockData = {
      stockCode,
      basic: {
        stockCode: stockCode,
        stockName: getStockNameByCode(stockCode),
        closePrice: null,
        compareToPreviousPrice: null,
        fluctuationsRatio: null,
        accumulatedTradingVolume: null,
        dataSource: 'optimized_fallback'
      },
      chart: null,
      news: null,
      investor: null,
      fetchTime: new Date().toISOString()
    };

    // 단일 API 호출 (5초 타임아웃)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://m.stock.naver.com/api/item/overviewItem.nhn?code=${stockCode}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': 'https://finance.naver.com/',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && (data.closePrice || data.stockName)) {
          stockData.basic = { ...stockData.basic, ...data, dataSource: 'api' };
        }
      }
    } catch (error) {
      console.log('API 호출 실패 (타임아웃 또는 오류), fallback 데이터 사용');
    }

    console.log('최적화된 데이터 수집 완료:', stockData);
    return stockData;
    
  } catch (error) {
    console.error('주식 데이터 조회 중 오류:', error);
    
    // 최소 구조 반환
    return {
      stockCode,
      basic: {
        stockCode: stockCode,
        stockName: getStockNameByCode(stockCode),
        closePrice: null,
        compareToPreviousPrice: null,
        fluctuationsRatio: null,
        accumulatedTradingVolume: null,
        dataSource: 'error_fallback'
      },
      fetchTime: new Date().toISOString(),
      error: error.message
    };
  }
}

function extractStockDataFromHTML(html, stockCode) {
  try {
    // HTML에서 주식 정보 추출 (간단한 정규식 사용)
    const priceMatch = html.match(/class="blind">현재가\s*(\d+,?\d*)/);
    const changeMatch = html.match(/class="blind">전일대비\s*([+-]?\d+,?\d*)/);
    const ratioMatch = html.match(/class="blind">등락률\s*([+-]?[\d.]+)%/);
    const nameMatch = html.match(/<title>([^-]+)-/);
    
    return {
      stockCode: stockCode,
      stockName: nameMatch ? nameMatch[1].trim() : getStockNameByCode(stockCode),
      closePrice: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null,
      compareToPreviousPrice: changeMatch ? parseInt(changeMatch[1].replace(/,/g, '')) : null,
      fluctuationsRatio: ratioMatch ? parseFloat(ratioMatch[1]) : null,
      accumulatedTradingVolume: null,
      dataSource: 'html_extraction'
    };
  } catch (error) {
    console.error('HTML 데이터 추출 오류:', error);
    return null;
  }
}

function getStockNameByCode(code) {
  const stockMap = {
    '005930': '삼성전자',
    '000660': 'SK하이닉스',
    '035420': '네이버',
    '035720': '카카오',
    '051910': 'LG화학',
    '006400': '삼성SDI',
    '005380': '현대차',
    '000270': '기아',
    '005490': 'POSCO홀딩스',
    '068270': '셀트리온',
    '373220': 'LG에너지솔루션',
    '207940': '삼성바이오로직스',
    '352820': '하이브',
    '259960': '크래프톤',
    '036570': '엔씨소프트',
    '251270': '넷마블'
  };
  return stockMap[code] || `종목${code}`;
}

async function analyzeStockWithChatGPT(stockData) {
  try {
    const storageInfo = await chrome.storage.sync.get(['openaiApiKey']);
    const apiKey = storageInfo.openaiApiKey;
    
    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const prompt = createAnalysisPrompt(stockData);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '한국 주식 전문 애널리스트로서 간결하고 실용적인 분석을 제공해주세요. 응답은 UTF-8 인코딩으로 해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`ChatGPT API 호출 실패: ${response.status}`);
    }

    const chatResponse = await response.json();
    const content = chatResponse.choices[0].message.content;
    
    console.log('ChatGPT 응답:', content);
    console.log('응답 타입:', typeof content);
    console.log('응답 길이:', content ? content.length : 0);
    
    return content;
  } catch (error) {
    console.error('ChatGPT 분석 실패:', error);
    throw error;
  }
}

function createAnalysisPrompt(stockData) {
  const { stockCode, basic, followUpQuestion } = stockData;
  
  // 후속 질문이 있는 경우 간단한 프롬프트 반환
  if (followUpQuestion) {
    return followUpQuestion;
  }
  
  const stockName = (basic && basic.stockName) ? basic.stockName : getStockNameByCode(stockCode);
  const hasRealData = basic && basic.closePrice && basic.dataSource === 'api';
  
  // 간소화된 프롬프트
  let prompt = `${stockName} (${stockCode}) 주식 분석:\n\n`;
  
  if (hasRealData) {
    prompt += `현재가: ${basic.closePrice.toLocaleString()}원\n`;
    if (basic.compareToPreviousPrice && basic.fluctuationsRatio) {
      prompt += `전일대비: ${basic.compareToPreviousPrice > 0 ? '+' : ''}${basic.compareToPreviousPrice.toLocaleString()}원 (${basic.fluctuationsRatio > 0 ? '+' : ''}${basic.fluctuationsRatio}%)\n\n`;
    }
  }
  
  prompt += `다음 형식으로 분석해주세요:

📊 사업 특성 & 최근 동향
**핵심 사업**: [주요 사업 영역]
**최근 동향**: [시장 상황과 성과]

📈 투자 포인트 & 주의사항  
**투자 포인트**: [강점과 기회]
**주의사항**: [리스크 요소]

📰 업계 이슈 & 영향
**업계 이슈**: [관련 업계 동향]
**영향 분석**: [주가에 미치는 영향]

💡 투자 고려사항 (장/단기)
**단기 전망**: [3-6개월 관점]
**장기 전망**: [1년+ 관점]

각 항목을 간결하고 명확하게 작성해주세요.`;
  
  return prompt;
}