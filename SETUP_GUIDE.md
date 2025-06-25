# 주식 분석 크롬 익스텐션 설치 가이드

## 전체 아키텍처
- 크롬 익스텐션이 웹페이지에서 주식 키워드를 감지
- 브릿지 서버를 통해 MCP 서버에서 데이터 수집
- OpenAI API로 분석 후 결과 표시

## 설치 순서

### 1. MCP 서버 설치
```bash
# uv 설치 (없는 경우)
curl -LsSf https://astral.sh/uv/install.sh | sh

# MCP 서버 실행
uvx kospi-kosdaq-stock-server
```

### 2. 브릿지 서버 실행
```bash
# 의존성 설치
npm install

# 서버 시작
npm start
# 또는 개발 모드
npm run dev
```

### 3. 크롬 익스텐션 설치
1. Chrome에서 `chrome://extensions/` 접속
2. 우측 상단 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `stock-analyzer-extension` 폴더 선택

### 4. API 키 설정
1. 브라우저 툴바의 익스텐션 아이콘 클릭
2. OpenAI API 키 입력 (https://platform.openai.com/api-keys 에서 발급)
3. 저장 버튼 클릭

## 사용법
- 웹페이지에서 주식명이나 종목코드가 자동으로 하이라이트됨
- 클릭시 해당 종목의 실시간 데이터와 AI 분석 표시

## 문제 해결
- 익스텐션이 작동하지 않는 경우: 페이지 새로고침
- 데이터를 가져오지 못하는 경우: 브릿지 서버 실행 확인
- API 오류 발생시: OpenAI API 키와 잔액 확인