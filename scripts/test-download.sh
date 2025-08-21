#!/bin/bash

# 단일 다운로드 테스트
ID=1001
OUTPUT_DIR="data/whiskybase-mirror-en"

echo "🧪 단일 다운로드 테스트: ID $ID"

# 디렉토리 생성
mkdir -p "$OUTPUT_DIR"

# wget 실행 (상세 출력)
wget --mirror \
    --convert-links \
    --adjust-extension \
    --page-requisites \
    --no-parent \
    --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
    --header="Accept-Language: en-US,en;q=0.9" \
    --wait=2 \
    --tries=2 \
    --timeout=30 \
    --directory-prefix="$OUTPUT_DIR" \
    "https://www.whiskybase.com/whisky/$ID" 2>&1 | tee test_download.log

# 결과 확인
if [ $? -eq 0 ]; then
    echo "✅ wget 성공"
    
    # 파일 확인
    TARGET_FILE="$OUTPUT_DIR/www.whiskybase.com/whisky/$ID/index.html"
    if [ -f "$TARGET_FILE" ]; then
        echo "✅ 파일 존재: $TARGET_FILE"
        echo "📏 파일 크기: $(ls -lh "$TARGET_FILE" | awk '{print $5}')"
    else
        echo "❌ 파일 없음: $TARGET_FILE"
        echo "📁 생성된 디렉토리:"
        find "$OUTPUT_DIR" -name "*$ID*" -type d
    fi
else
    echo "❌ wget 실패"
fi

echo "🏁 테스트 완료" 