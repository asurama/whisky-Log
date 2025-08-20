#!/bin/bash

# 설정
START_ID=1001
END_ID=50000  # 최대 ID (필요에 따라 조정)
OUTPUT_DIR="data/whiskybase-mirror-en"
LOG_FILE="download_continue.log"
ERROR_LOG="download_continue_errors.log"
PROGRESS_FILE="download_progress_continue.txt"
BATCH_SIZE=10   # 배치 크기를 더 작게 설정
BATCH_DELAY=120 # 배치 간 대기 시간을 더 길게 설정

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error_log() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$ERROR_LOG"
}

warn_log() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# 진행 상황 로드
if [ -f "$PROGRESS_FILE" ]; then
    echo -e "${BLUE}📋 이전 진행 상황 발견${NC}"
    START_ID=$(tail -n 1 "$PROGRESS_FILE" | cut -d' ' -f1)
    echo -e "${BLUE}🔄 $((START_ID + 1))부터 재시작합니다${NC}"
    START_ID=$((START_ID + 1))
fi

# 실패한 ID 파일이 있으면 확인
if [ -f "$OUTPUT_DIR/failed_ids.txt" ]; then
    echo -e "${YELLOW}⚠️ 이전에 실패한 ID들이 있습니다:${NC}"
    head -10 "$OUTPUT_DIR/failed_ids.txt" | while read failed_id; do
        echo -e "${YELLOW}   - $failed_id${NC}"
    done
    failed_count=$(wc -l < "$OUTPUT_DIR/failed_ids.txt" 2>/dev/null || echo "0")
    echo -e "${YELLOW}   ... (총 $failed_count개)${NC}"
fi

# 디렉토리 생성
mkdir -p "$OUTPUT_DIR"

# 통계 초기화
TOTAL_DOWNLOADED=0
TOTAL_SUCCESS=0
TOTAL_FAILED=0
BATCH_COUNT=0

log "🚀 Whiskybase 대량 다운로드 시작: $START_ID ~ $END_ID"
log "📁 출력 디렉토리: $OUTPUT_DIR"
log "📦 배치 크기: $BATCH_SIZE"
log "⏱️ 배치 간 대기: ${BATCH_DELAY}초"

# 중단 신호 처리
cleanup() {
    log "⏹️ 다운로드 중단됨"
    log "📊 최종 통계: 성공=$TOTAL_SUCCESS, 실패=$TOTAL_FAILED, 총=$TOTAL_DOWNLOADED"
    exit 1
}

trap cleanup INT TERM

# 배치 다운로드 함수
download_batch() {
    local batch_start=$1
    local batch_end=$2
    local batch_success=0
    local batch_failed=0
    
    log "📦 배치 $((++BATCH_COUNT)) 시작: $batch_start ~ $batch_end"
    
    for id in $(seq $batch_start $batch_end); do
        TOTAL_DOWNLOADED=$((TOTAL_DOWNLOADED + 1))
        
        # 이미 다운로드된 파일 확인 (여러 가능한 경로)
        local target_file1="$OUTPUT_DIR/www.whiskybase.com/whisky/$id/index.html"
        local target_file2="$OUTPUT_DIR/www.whiskybase.com/whisky/$id.html"
        if [ -f "$target_file1" ] || [ -f "$target_file2" ]; then
            warn_log "ID $id: 이미 존재함 (건너뜀)"
            batch_success=$((batch_success + 1))
            TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
            continue
        fi
        
        echo -n "다운로드 중: $id/$END_ID "
        
        # 디버깅: 실제 다운로드할 URL 출력
        echo "URL: https://www.whiskybase.com/whisky/$id" >> "$LOG_FILE"
        
        # wget 실행
        wget --mirror \
            --convert-links \
            --adjust-extension \
            --page-requisites \
            --no-parent \
            --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
            --header="Accept-Language: en-US,en;q=0.9" \
            --wait=3 \
            --tries=2 \
            --timeout=30 \
            --no-verbose \
            --quiet \
            --directory-prefix="$OUTPUT_DIR" \
            "https://www.whiskybase.com/whisky/$id" \
            >> "$LOG_FILE" 2>> "$ERROR_LOG"
        
        # 결과 확인 (더 관대한 조건)
        if [ $? -eq 0 ]; then
            # 여러 가능한 파일 경로 확인
            local target_file1="$OUTPUT_DIR/www.whiskybase.com/whisky/$id/index.html"
            local target_file2="$OUTPUT_DIR/www.whiskybase.com/whisky/$id.html"
            if [ -f "$target_file1" ] || [ -f "$target_file2" ] || [ -d "$OUTPUT_DIR/www.whiskybase.com/whisky/$id" ]; then
                echo -e "${GREEN}✅ 성공${NC}"
                batch_success=$((batch_success + 1))
                TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
            else
                echo -e "${YELLOW}⚠️ 부분 성공 (파일 없음)${NC}"
                # 디버깅: 실제 생성된 파일 확인
                echo "🔍 디버깅: 생성된 파일 확인" >> "$LOG_FILE"
                find "$OUTPUT_DIR" -name "*$id*" -type f 2>/dev/null >> "$LOG_FILE"
                batch_success=$((batch_success + 1))
                TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
            fi
        else
            echo -e "${RED}❌ 실패${NC}"
            batch_failed=$((batch_failed + 1))
            TOTAL_FAILED=$((TOTAL_FAILED + 1))
            
            # 실패한 ID를 별도 파일에 기록
            echo "$id" >> "$OUTPUT_DIR/failed_ids.txt"
        fi
        
        # 진행 상황 저장
        echo "$id $(date '+%Y-%m-%d %H:%M:%S')" >> "$PROGRESS_FILE"
        
        # 개별 요청 간 대기
        sleep 2
    done
    
    log "📦 배치 $BATCH_COUNT 완료: 성공=$batch_success, 실패=$batch_failed"
    
    # 배치 간 대기
    if [ $batch_end -lt $END_ID ]; then
        log "⏱️ ${BATCH_DELAY}초 대기 중..."
        sleep $BATCH_DELAY
    fi
}

# 메인 다운로드 루프
current_id=$START_ID

while [ $current_id -le $END_ID ]; do
    batch_end=$((current_id + BATCH_SIZE - 1))
    
    # 마지막 배치 조정
    if [ $batch_end -gt $END_ID ]; then
        batch_end=$END_ID
    fi
    
    # 배치 다운로드 실행
    download_batch $current_id $batch_end
    
    # 다음 배치 시작 ID 계산
    current_id=$((batch_end + 1))
    
    # 진행률 표시
    progress=$((TOTAL_DOWNLOADED * 100 / (END_ID - START_ID + 1)))
    log "📊 전체 진행률: $progress% ($TOTAL_DOWNLOADED/$((END_ID - START_ID + 1)))"
    
    # 성공률 표시
    if [ $TOTAL_DOWNLOADED -gt 0 ]; then
        success_rate=$((TOTAL_SUCCESS * 100 / TOTAL_DOWNLOADED))
        log "📈 성공률: $success_rate% ($TOTAL_SUCCESS/$TOTAL_DOWNLOADED)"
    fi
done

# 최종 결과
log "🎉 다운로드 완료!"
log "📊 최종 통계:"
log "   📁 총 다운로드: $TOTAL_DOWNLOADED"
log "   ✅ 성공: $TOTAL_SUCCESS"
log "   ❌ 실패: $TOTAL_FAILED"
log "   📦 배치 수: $BATCH_COUNT"

if [ $TOTAL_DOWNLOADED -gt 0 ]; then
    final_success_rate=$((TOTAL_SUCCESS * 100 / TOTAL_DOWNLOADED))
    log "   📈 최종 성공률: $final_success_rate%"
fi

# 진행 상황 파일 정리
rm -f "$PROGRESS_FILE"

log "🏁 스크립트 종료" 