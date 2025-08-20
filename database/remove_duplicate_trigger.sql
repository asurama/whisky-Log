-- 중복 용량 업데이트 트리거 제거
-- TastingModal에서만 용량을 관리하도록 함

-- 1. 트리거 제거
DROP TRIGGER IF EXISTS update_bottle_on_tasting ON tastings;

-- 2. 트리거 함수 제거
DROP FUNCTION IF EXISTS update_bottle_status_on_tasting();

-- 3. 확인: 트리거가 제거되었는지 확인
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'update_bottle_on_tasting'; 