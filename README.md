# 점심식사비 리포트

Next.js + TypeScript + Drizzle ORM + Neon PostgreSQL 기반의 소규모 내부 업무용 웹앱 스타터입니다.

## 실행
1. `npm install`
2. `.env.example`을 `.env.local`로 복사
3. `.env.local`에 Neon의 `DATABASE_URL` 입력
4. `npx drizzle-kit push`
5. `npm run dev`

## GitHub / 배포
GitHub는 소스 저장소로 사용하고 Vercel에서 배포하는 구성을 권장합니다. 이 앱은 Server Actions와 Neon DB를 사용하므로 GitHub Pages의 정적 호스팅 방식과는 맞지 않습니다.

## 현재 기능
- 월별 요약
- 식사 등록
- 참여자별 금액
- 구성원 등록
- 식당 등록
- 구성원별 집계
- 최근 기록

수정/삭제, CSV, 로그인/권한, 월 선택 UI 등은 다음 단계에서 확장할 수 있습니다.
