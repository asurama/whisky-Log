# 🚨 Supabase Storage 빠른 해결 가이드

## **즉시 해결해야 할 문제:**
- **400 Bad Request** 오류 발생
- `whisky-bottles` 버킷이 존재하지 않음

## **🔧 5분 해결 방법:**

### **1. Supabase 대시보드 접속**
1. [https://supabase.com/dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택

### **2. Storage 버킷 생성**
1. 왼쪽 메뉴에서 **"Storage"** 클릭
2. **"New bucket"** 버튼 클릭
3. **Bucket name**: `whisky-bottles` (정확히 이 이름으로)
4. **Public bucket** 체크박스 ✅ 체크
5. **"Create bucket"** 클릭

### **3. 권한 정책 설정**
1. **"Policies"** 탭 클릭
2. **"New Policy"** 클릭
3. **"Create a policy from scratch"** 선택
4. 다음 설정 입력:

**Policy Name**: `Allow authenticated uploads`
**Target roles**: `authenticated`
**Policy definition**:
```sql
(bucket_id = 'whisky-bottles'::text)
```

5. **"Review"** → **"Save policy"** 클릭

### **4. 추가 정책 (선택사항)**
**조회 권한 추가:**
1. **"New Policy"** 다시 클릭
2. **Policy Name**: `Allow public viewing`
**Target roles**: `anon, authenticated`
**Policy definition**:
```sql
(bucket_id = 'whisky-bottles'::text)
```

## **✅ 테스트**
1. 위스키 추가/수정 모달 열기
2. 이미지 파일 선택
3. 저장 버튼 클릭
4. 성공하면 썸네일이 표시됨

## **🔍 여전히 오류가 발생한다면:**

### **브라우저 개발자 도구에서 확인:**
1. **F12** 키 누르기
2. **Console** 탭에서 오류 메시지 확인
3. **Network** 탭에서 요청/응답 확인

### **일반적인 추가 오류:**
- **403 Forbidden**: 권한 정책 문제
- **413 Payload Too Large**: 파일 크기 제한 (5MB 초과)
- **415 Unsupported Media Type**: 지원하지 않는 파일 형식

## **📞 추가 도움이 필요하면:**
- 브라우저 개발자 도구의 **Console** 탭에서 나오는 정확한 오류 메시지 공유
- **Network** 탭에서 **Status** 코드와 **Response** 내용 공유 