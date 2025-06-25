# 클라우드/서버리스 대안

## 방법 1: Vercel/Netlify Functions
브릿지 서버를 서버리스 함수로 배포:

```javascript
// api/stock/[ticker].js (Vercel)
export default async function handler(req, res) {
  const { ticker } = req.query;
  // MCP 서버 대신 직접 주식 API 호출
  const stockData = await fetchFromStockAPI(ticker);
  res.json(stockData);
}
```

## 방법 2: Chrome Extension Native Messaging
네이티브 앱을 통한 로컬 서버 자동 실행:

1. 네이티브 호스트 앱 생성
2. 익스텐션에서 네이티브 앱 시작
3. 네이티브 앱이 MCP 서버 관리

## 방법 3: 공개 API 직접 사용
MCP 서버 없이 공개 주식 API 사용:
- 한국투자증권 OpenAPI
- KIS Developers API
- Yahoo Finance API (해외 주식)

## 방법 4: Electron 앱
데스크톱 앱으로 패키징:
- 서버와 UI를 하나로 통합
- 시스템 트레이에서 실행
- 자동 시작 옵션 제공