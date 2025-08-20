# Supabase Storage 설정 가이드

## **🔧 Storage 버킷 생성 및 권한 설정**

### **1. Supabase 대시보드 접속**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택

### **2. Storage 버킷 생성**
1. **Storage** 메뉴 클릭
2. **New bucket** 버튼 클릭
3. **버킷 이름**: `whisky-bottles`
4. **Public bucket** 체크 (이미지 공개 접근 허용)
5. **Create bucket** 클릭

### **3. Storage RLS 정책 설정**
1. **Storage** → **Policies** 탭 클릭
2. **whisky-bottles** 버킷 선택
3. **New Policy** 클릭

#### **업로드 정책 (INSERT)**
```sql
-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'whisky-bottles' AND 
  auth.role() = 'authenticated'
);
```

#### **조회 정책 (SELECT)**
```sql
-- 모든 사용자가 이미지 조회 가능 (공개)
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'whisky-bottles');
```

#### **수정 정책 (UPDATE)**
```sql
-- 자신이 업로드한 이미지만 수정 가능
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'whisky-bottles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **삭제 정책 (DELETE)**
```sql
-- 자신이 업로드한 이미지만 삭제 가능
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'whisky-bottles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### **4. 대안: 간단한 공개 정책**
만약 위의 정책이 복잡하다면, 임시로 모든 인증된 사용자에게 모든 권한을 부여:

```sql
-- 모든 인증된 사용자에게 모든 권한 (임시)
CREATE POLICY "Authenticated users have all permissions" ON storage.objects
FOR ALL USING (bucket_id = 'whisky-bottles' AND auth.role() = 'authenticated');
```

### **5. 파일 경로 구조 (선택사항)**
더 안전한 구조를 위해 사용자별 폴더 구조 사용:

```typescript
// WhiskyModal.tsx에서 파일 경로 수정
const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
```

## **🔍 문제 해결**

### **일반적인 오류들:**
1. **403 Forbidden**: 권한 정책 문제
2. **404 Not Found**: 버킷이 존재하지 않음
3. **413 Payload Too Large**: 파일 크기 제한

### **디버깅 방법:**
1. **브라우저 개발자 도구** → **Network** 탭에서 오류 확인
2. **Supabase 대시보드** → **Logs**에서 서버 오류 확인
3. **Storage** → **Files**에서 파일 업로드 상태 확인

## **✅ 설정 완료 후 테스트**

1. 위스키 추가/수정 모달 열기
2. 이미지 파일 선택
3. 저장 후 썸네일 확인
4. 브라우저 개발자 도구에서 오류 메시지 확인 