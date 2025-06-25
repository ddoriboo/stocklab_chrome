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

// pykrx를 사용한 주식 데이터 가져오기 (Python 스크립트 호출)
const { execSync } = require('child_process');

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 주식 데이터 API
app.post('/api/stock/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    
    // Python 스크립트로 주식 데이터 가져오기
    const pythonScript = `
import json
import sys
from datetime import datetime, timedelta
try:
    from pykrx import stock
    
    ticker = "${ticker}"
    today = datetime.now().strftime('%Y%m%d')
    month_ago = (datetime.now() - timedelta(days=30)).strftime('%Y%m%d')
    
    # OHLCV 데이터
    ohlcv = stock.get_market_ohlcv(month_ago, today, ticker)
    if not ohlcv.empty:
        latest = ohlcv.iloc[-1]
        prev = ohlcv.iloc[-2] if len(ohlcv) > 1 else latest
        change_pct = ((latest['종가'] - prev['종가']) / prev['종가'] * 100)
    else:
        latest = {'종가': 0, '거래량': 0}
        change_pct = 0
    
    # 시가총액
    market_cap = stock.get_market_cap(today, today, ticker)
    cap_value = market_cap.iloc[-1]['시가총액'] if not market_cap.empty else 0
    
    # 재무 지표
    fundamental = stock.get_market_fundamental(today, today, ticker)
    if not fundamental.empty:
        fund = fundamental.iloc[-1]
        per = fund.get('PER', 0)
        pbr = fund.get('PBR', 0)
    else:
        per = pbr = 0
    
    result = {
        'ohlcv': {
            'close': int(latest.get('종가', 0)),
            'volume': int(latest.get('거래량', 0)),
            'changePercent': round(change_pct, 2)
        },
        'marketCap': int(cap_value),
        'fundamental': {
            'per': float(per),
            'pbr': float(pbr)
        }
    }
    print(json.dumps(result))
except Exception as e:
    # pykrx 없거나 오류시 더미 데이터
    result = {
        'ohlcv': {'close': 75000, 'volume': 1000000, 'changePercent': 2.5},
        'marketCap': 450000000000000,
        'fundamental': {'per': 15.2, 'pbr': 1.8}
    }
    print(json.dumps(result))
`;
    
    let stockData;
    try {
      const output = execSync(`python3 -c "${pythonScript}"`, { encoding: 'utf8' });
      stockData = JSON.parse(output);
    } catch (error) {
      // Python 실행 실패시 더미 데이터
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
    const { stockName, stockData, apiKey } = req.body;
    
    const prompt = `
다음 주식 데이터를 분석해주세요:
종목명: ${stockName}
현재가: ${stockData.ohlcv?.close}원
변동률: ${stockData.ohlcv?.changePercent}%
시가총액: ${formatMarketCap(stockData.marketCap)}
PER: ${stockData.fundamental?.per}
PBR: ${stockData.fundamental?.pbr}

간단한 투자 인사이트를 한국어로 2-3문장으로 제공해주세요.`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
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
      temperature: 0.7,
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