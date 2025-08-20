#!/usr/bin/env node

// dotenv로 환경변수 로드
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 환경변수 로드 시도
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// .env.local 파일에서 직접 로드 시도
if (!supabaseUrl || !supabaseKey) {
  try {
    const fs = require('fs');
    const envPath = path.join(__dirname, '..', '.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      supabaseUrl = supabaseUrl || envVars.NEXT_PUBLIC_SUPABASE_URL;
      supabaseKey = supabaseKey || envVars.SUPABASE_SERVICE_ROLE_KEY;
    }
  } catch (error) {
    console.error('❌ .env.local 파일 로드 오류:', error.message);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  console.error('현재 값:');
  console.error('URL:', supabaseUrl ? '설정됨' : '없음');
  console.error('KEY:', supabaseKey ? '설정됨' : '없음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseProgress() {
  try {
    const { count, error } = await supabase
      .from('whiskybase_data')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('❌ 데이터베이스 조회 오류:', error.message);
    return 0;
  }
}

function checkFileProgress() {
  try {
    // 여러 가능한 디렉토리 확인
    const possibleDirs = [
      path.join(__dirname, '..', 'mirror'),
      path.join(__dirname, '..', 'data', 'whiskybase-mirror'),
      path.join(__dirname, '..', 'data', 'whiskybase-mirror-en'),
      path.join(__dirname, '..', 'data', 'whiskybase-mirror', 'www.whiskybase.com'),
      path.join(__dirname, '..', 'data', 'whiskybase-mirror-en', 'www.whiskybasebase.com')
    ];
    
    let totalFiles = 0;
    let foundDir = null;
    
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        foundDir = dir;
        const files = fs.readdirSync(dir, { recursive: true });
        const htmlFiles = files.filter(file => typeof file === 'string' && file.endsWith('.html'));
        totalFiles += htmlFiles.length;
      }
    }
    
    if (foundDir) {
      console.log(`📁 발견된 디렉토리: ${foundDir}`);
    }
    
    return totalFiles;
  } catch (error) {
    console.error('❌ 파일 시스템 조회 오류:', error.message);
    return 0;
  }
}

function checkProcessStatus() {
  try {
    const { execSync } = require('child_process');
    const output = execSync('ps aux | grep -E "(whiskybase-crawler|parse-whiskybase)" | grep -v grep', { encoding: 'utf8' });
    return output.trim().split('\n').length;
  } catch (error) {
    return 0; // 프로세스가 실행되지 않음
  }
}

function formatNumber(num) {
  return num.toLocaleString();
}

function getProgressBar(current, total, width = 20) {
  if (total === 0) return '[' + ' '.repeat(width) + '] 0%';
  
  const percentage = Math.min(current / total, 1);
  const filled = Math.round(width * percentage);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = Math.round(percentage * 100);
  
  return `[${bar}] ${percent}%`;
}

async function displayStatus() {
  console.clear();
  console.log('🚀 Whiskybase 크롤링 모니터링');
  console.log('=' .repeat(50));
  
  // 데이터베이스 진행상황
  const dbCount = await checkDatabaseProgress();
  console.log(`📊 데이터베이스 저장: ${formatNumber(dbCount)}개 레코드`);
  
  // 파일 진행상황
  const fileCount = checkFileProgress();
  console.log(`📁 다운로드된 파일: ${formatNumber(fileCount)}개 HTML`);
  
  // 프로세스 상태
  const processCount = checkProcessStatus();
  const processStatus = processCount > 0 ? '🟢 실행 중' : '🔴 중지됨';
  console.log(`⚙️  크롤링 프로세스: ${processStatus}`);
  
  // 진행률 (실제 목표: 50,000개 기준)
  const estimatedTotal = 50000;
  console.log('\n📈 진행률:');
  console.log(`   파일: ${getProgressBar(fileCount, estimatedTotal)}`);
  console.log(`   DB:   ${getProgressBar(dbCount, estimatedTotal)}`);
  
  // 남은 작업량
  const remainingFiles = Math.max(0, estimatedTotal - fileCount);
  const remainingDB = Math.max(0, estimatedTotal - dbCount);
  console.log(`\n📋 남은 작업: 파일 ${formatNumber(remainingFiles)}개, DB ${formatNumber(remainingDB)}개`);
  
  // 데이터 샘플 및 통계
  if (dbCount > 0) {
    try {
      // 최근 저장된 데이터
      const { data: recentData, error: recentError } = await supabase
        .from('whiskybase_data')
        .select('name, brand, type, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!recentError && recentData && recentData.length > 0) {
        console.log('\n🆕 최근 저장된 데이터:');
        recentData.forEach((item, index) => {
          const name = item.name ? (item.name.length > 40 ? item.name.substring(0, 40) + '...' : item.name) : '이름 없음';
          const brand = item.brand || '브랜드 없음';
          const type = item.type || '';
          console.log(`   ${index + 1}. ${name}`);
          console.log(`      브랜드: ${brand}${type ? ` | 타입: ${type}` : ''}`);
        });
      }

      // 브랜드별 통계
      const { data: brandStats, error: brandError } = await supabase
        .from('whiskybase_data')
        .select('brand')
        .not('brand', 'is', null);
      
      if (!brandError && brandStats) {
        const brandCounts = {};
        brandStats.forEach(item => {
          if (item.brand) {
            brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
          }
        });
        
        const topBrands = Object.entries(brandCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);
        
        if (topBrands.length > 0) {
          console.log('\n🏷️ 상위 브랜드 (저장된 데이터 기준):');
          topBrands.forEach(([brand, count], index) => {
            console.log(`   ${index + 1}. ${brand}: ${count}개`);
          });
        }
      }

      // 타입별 통계
      const { data: typeStats, error: typeError } = await supabase
        .from('whiskybase_data')
        .select('type')
        .not('type', 'is', null);
      
      if (!typeError && typeStats) {
        const typeCounts = {};
        typeStats.forEach(item => {
          if (item.type) {
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
          }
        });
        
        const topTypes = Object.entries(typeCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3);
        
        if (topTypes.length > 0) {
          console.log('\n🥃 상위 타입:');
          topTypes.forEach(([type, count], index) => {
            console.log(`   ${index + 1}. ${type}: ${count}개`);
          });
        }
      }
      
    } catch (error) {
      console.log('\n⚠️ 데이터 샘플 조회 중 오류:', error.message);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🔄 5초마다 업데이트됩니다... (Ctrl+C로 종료)');
}

// 초기 실행
displayStatus();

// 5초마다 업데이트
setInterval(displayStatus, 5000); 