const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS 설정 - Chrome Extension에서 접근 가능하도록
app.use(cors({
  origin: ['chrome-extension://*', 'http://localhost:*', 'https://*'],
  credentials: true
}));
app.use(express.json());

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 주식 데이터 API
app.post('/api/stock/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    
    // 네이버 금융 API 사용 (공개 API)
    let stockData = {};
    
    try {
      // 기본 정보 조회
      const basicUrl = `https://api.stock.naver.com/stock/${ticker}/basic`;
      const response = await axios.get(basicUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const data = response.data;
      
      stockData = {
        ohlcv: {
          close: data.closePrice || 75000,
          volume: data.accumulatedTradingVolume || 1000000,
          changePercent: data.fluctuationsRatio || 2.5
        },
        marketCap: data.marketValue || 450000000000000,
        fundamental: {
          per: data.per || 15.2,
          pbr: data.pbr || 1.8
        }
      };
    } catch (naverError) {
      console.log('Naver API failed, using mock data');
      // 네이버 API 실패시 더미 데이터
      stockData = {
        ohlcv: { close: 75000, volume: 1000000, changePercent: 2.5 },
        marketCap: 450000000000000,
        fundamental: { per: 15.2, pbr: 1.8 }
      };
    }
    
    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// OpenAI 프록시 (CORS 회피)
app.post('/api/analyze', async (req, res) => {
  try {
    const { stockName, stockData, apiKey, question } = req.body;
    
    let prompt;
    
    if (question) {
      // 후속 질문인 경우
      prompt = `${stockName}에 대한 질문: ${question}
      
한국어로 전문적이고 구체적인 답변을 2-3문장으로 제공해주세요.`;
    } else {
      // 일반 분석인 경우
      prompt = `
다음 주식 데이터를 분석해주세요:
종목명: ${stockName}
현재가: ${stockData.ohlcv?.close}원
변동률: ${stockData.ohlcv?.changePercent}%
시가총액: ${formatMarketCap(stockData.marketCap)}
PER: ${stockData.fundamental?.per}
PBR: ${stockData.fundamental?.pbr}

간단한 투자 인사이트를 한국어로 2-3문장으로 제공해주세요.`;
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini-search-preview-2025-03-11',
      messages: [
        {
          role: 'system',
          content: '당신은 한국 주식 시장 전문 애널리스트입니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({ analysis: response.data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});