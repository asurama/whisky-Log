# Whisky Log

위스키 컬렉션과 시음 기록을 관리하는 웹 애플리케이션입니다.

## 🆕 새로운 기능: Whiskybase 데이터베이스 통합

### Whiskybase 데이터 스크래핑 및 저장
- Whiskybase에서 위스키 정보를 미리 스크래핑하여 데이터베이스에 저장
- 빠르고 안정적인 검색 기능 제공
- API 접근 제한 시에도 정상 작동

### 사용 방법

1. **데이터베이스 테이블 생성**
   ```sql
   -- database/add_whiskybase_table.sql 실행
   ```

2. **Whiskybase 데이터 스크래핑**
   ```bash
   npm run scrape-whiskybase
   ```

3. **검색 기능 사용**
   - WhiskyModal에서 "Whiskybase 검색" 버튼 클릭
   - 데이터베이스에서 먼저 검색 후, 실패 시 기존 API로 폴백

### 데이터베이스 구조
- `whiskybase_data` 테이블에 위스키 정보 저장
- 전체 텍스트 검색 인덱스로 빠른 검색 지원
- 평점, 연도, 지역 등 다양한 필터링 가능

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
