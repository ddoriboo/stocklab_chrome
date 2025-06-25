# 주식 분석 크롬 익스텐션 아키텍처

## 전체 구조
```
웹페이지 → Content Script → Background Script → MCP Server → OpenAI API
                                              ↓
                                         Stock Data
```

## 구성 요소

### 1. Content Script
- 웹페이지에서 주식 관련 키워드 감지
- 주식 종목명, 티커 심볼 식별
- Background Script에 분석 요청

### 2. Background Script  
- MCP 서버와 통신
- OpenAI API 호출
- 분석 결과 처리

### 3. MCP Server (kospi-kosdaq-stock-server)
- 주식 데이터 제공
- OHLCV, 시가총액, PER/PBR 등

### 4. OpenAI API
- 수집된 데이터 분석
- 투자 인사이트 생성

## 작동 흐름
1. Content Script가 주식 키워드 감지
2. Background Script가 MCP 서버에서 데이터 수집
3. OpenAI API로 분석 요청
4. 결과를 팝업이나 오버레이로 표시