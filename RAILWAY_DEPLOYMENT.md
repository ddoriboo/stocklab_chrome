# Railway 배포 가이드

## 1. Railway 프로젝트 생성

1. [Railway](https://railway.app) 가입/로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. GitHub 저장소 연결

## 2. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수 추가:
- `PORT`: 자동으로 설정됨 (Railway가 제공)
- `NODE_ENV`: production

## 3. 배포

```bash
# GitHub에 푸시
git add .
git commit -m "Initial deployment"
git push origin main
```

Railway가 자동으로 빌드하고 배포합니다.

## 4. 배포 URL 확인

Railway 대시보드에서:
1. 프로젝트 클릭
2. "Settings" 탭
3. "Domains" 섹션에서 URL 확인
   예: `https://your-app.railway.app`

## 5. Chrome Extension 설정

1. 익스텐션 팝업 열기
2. 서버 URL에 Railway URL 입력
3. OpenAI API 키 입력
4. 저장

## 주의사항

- Railway는 무료 플랜에서 월 $5 크레딧 제공
- 서버가 일정 시간 사용되지 않으면 슬립 모드로 전환될 수 있음
- Python 패키지(pykrx)가 제대로 설치되지 않으면 더미 데이터 사용

## 대안: 한국투자증권 API 사용

pykrx 대신 공식 API를 사용하려면:
1. [한국투자증권 개발자센터](https://apiportal.koreainvestment.com) 가입
2. API 키 발급
3. server.js 수정하여 API 호출 구현