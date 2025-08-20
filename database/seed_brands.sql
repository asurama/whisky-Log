-- 기본 브랜드 데이터 삽입
-- 이 스크립트는 Supabase SQL 편집기에서 실행하세요

-- 기존 기본 브랜드 삭제 (user_id가 NULL인 브랜드들)
DELETE FROM brands WHERE user_id IS NULL;

-- 기본 브랜드 데이터 삽입
INSERT INTO brands (name, country, region, description, user_id, created_at, updated_at) VALUES
-- 스코틀랜드 브랜드
('Aberlour', '스코틀랜드', '스페이사이드(Speyside), 북부 스코틀랜드', '스페이사이드 지역의 전통적인 싱글 몰트 위스키', NULL, NOW(), NOW()),
('Balvenie', '스코틀랜드', '스페이사이드(Speyside), 더프타운(Dufftown)', '더프타운의 전통적인 위스키 제조소', NULL, NOW(), NOW()),
('Glendronach', '스코틀랜드', '하이랜드(Highlands), 애버딘셔(Aberdeenshire), 포규(Forgue) 인근', '하이랜드 지역의 전통적인 위스키', NULL, NOW(), NOW()),
('Glenfiddich', '스코틀랜드', '스페이사이드(Speyside), 모레이(Moray), 더프타운(Dufftown)', '세계에서 가장 유명한 싱글 몰트 위스키 중 하나', NULL, NOW(), NOW()),
('The Glenlivet', '스코틀랜드', '스페이사이드(Speyside), 모레이(Moray), 발린달로크(Ballindalloch) 근처', '스페이사이드의 대표적인 위스키', NULL, NOW(), NOW()),
('Glenmorangie', '스코틀랜드', '하이랜드(Highlands), 타인(Tain)', '하이랜드의 우아하고 부드러운 위스키', NULL, NOW(), NOW()),
('Lagavulin', '스코틀랜드', '이슬레이(Islay) 섬, 포트 엘런(Port Ellen) 인근', '이슬레이의 강렬한 피트 위스키', NULL, NOW(), NOW()),
('Laphroaig', '스코틀랜드', '이슬레이(Islay) 섬, 포트 엘런(Port Ellen) 근처 로흐 라프로익 해안', '이슬레이의 대표적인 피트 위스키', NULL, NOW(), NOW()),
('Macallan', '스코틀랜드', '스페이사이드(Speyside), 모레이(Moray), 크레이겔라키(Craigellachie) 근처', '세계 최고급 위스키로 알려진 브랜드', NULL, NOW(), NOW()),
('Oban', '스코틀랜드', '하이랜드(Highlands), 서해안 도시 오반(Oban)', '서해안의 독특한 해양성 위스키', NULL, NOW(), NOW()),
('Springbank', '스코틀랜드', '캠벨타운(Campbeltown), 남서부 해안', '캠벨타운의 전통적인 위스키', NULL, NOW(), NOW()),
('Talisker', '스코틀랜드', '스카이(Isle of Skye) 섬, 밍기니시 반도 Minginish Peninsula, 카보스트(Carbost) 마을', '스카이 섬의 해양성 위스키', NULL, NOW(), NOW()),

-- 미국 브랜드
('Jim Beam', '미국', '켄터키(Kentucky)', '켄터키의 대표적인 버번 위스키', NULL, NOW(), NOW()),
('Jack Daniel''s', '미국', '테네시(Tennessee)', '테네시 위스키의 대표 브랜드', NULL, NOW(), NOW()),
('Maker''s Mark', '미국', '켄터키(Kentucky)', '켄터키의 프리미엄 버번 위스키', NULL, NOW(), NOW()),
('Bulleit', '미국', '켄터키(Kentucky) 및 테네시(Tennessee)', '고라이 위스키로 유명한 브랜드', NULL, NOW(), NOW()),
('Woodford Reserve', '미국', '켄터키(Kentucky)', '켄터키의 프리미엄 버번 위스키', NULL, NOW(), NOW()),

-- 일본 브랜드
('Yamazaki', '일본', '시가현(Shiga Prefecture)', '일본 최초의 상업적 위스키 증류소', NULL, NOW(), NOW()),
('Hibiki', '일본', '오사카, 하카타 등 블렌디드', '일본의 대표적인 블렌디드 위스키', NULL, NOW(), NOW()),
('Nikka Yoichi', '일본', '홋카이도(Hokkaido)', '홋카이도의 전통적인 위스키', NULL, NOW(), NOW()),
('Hakushu', '일본', '야마나시현(Yamanashi Prefecture)', '야마나시의 깨끗한 자연에서 생산되는 위스키', NULL, NOW(), NOW()),
('Mars Shinshu', '일본', '나가노현(Nagano Prefecture)', '나가노의 고지대에서 생산되는 위스키', NULL, NOW(), NOW());

-- 삽입된 브랜드 수 확인
SELECT COUNT(*) as total_brands FROM brands WHERE user_id IS NULL; 