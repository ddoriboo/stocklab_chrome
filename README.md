# StockLab Chrome - 주식 분석 크롬 익스텐션

웹페이지에서 주식 키워드를 자동으로 감지하고 MCP 서버와 OpenAI API를 활용해 실시간 분석을 제공하는 크롬 익스텐션입니다.

## ✨ 주요 기능

- 🔍 **자동 키워드 감지**: 웹페이지에서 주식 종목명/코드 자동 인식
- 📊 **실시간 주식 데이터**: KOSPI/KOSDAQ 주식 정보 조회
- 🤖 **AI 분석**: OpenAI를 통한 투자 인사이트 생성
- ☁️ **Railway 배포**: 서버를 클라우드에서 24/7 운영

## 🚀 빠른 시작

### 1. Railway 배포
1. [Railway](https://railway.app)에서 이 저장소 연결
2. 자동 배포 완료 후 URL 확인

### 2. 크롬 익스텐션 설치
1. `chrome://extensions/` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `stock-analyzer-extension` 폴더 선택

### 3. 설정
1. 익스텐션 아이콘 클릭
2. Railway 서버 URL 입력
3. OpenAI API 키 입력
4. 저장

## 📱 사용법

웹페이지에서 주식 키워드(삼성전자, SK하이닉스 등)가 자동으로 하이라이트됩니다. 
하이라이트된 키워드를 클릭하면 해당 종목의 실시간 데이터와 AI 분석을 볼 수 있습니다.

## 🛠️ 기술 스택

- **Frontend**: Chrome Extension (Manifest V3)
- **Backend**: Node.js + Express
- **Data Source**: pykrx (한국 주식 데이터)
- **AI**: OpenAI GPT-3.5
- **Deployment**: Railway

## 📂 프로젝트 구조

```
├── stock-analyzer-extension/  # 크롬 익스텐션
│   ├── manifest.json
│   ├── content.js           # 키워드 감지
│   ├── background.js        # API 통신
│   └── popup.html/js        # 설정 UI
├── server.js                # 백엔드 서버
├── package.json
└── railway.json             # Railway 배포 설정
```

## 🔧 로컬 개발

```bash
# 서버 실행
npm install
npm run dev

# 익스텐션 로드
# chrome://extensions에서 stock-analyzer-extension 폴더 로드
```

## ⚠️ 주의사항

- OpenAI API 키가 필요합니다 (유료)
- Railway 무료 플랜은 월 $5 크레딧 제공
- 투자 결정은 신중히 하세요

## 📄 라이선스

MIT License