#!/usr/bin/env node
/**
 * SVG 파일에서 hotspot 요소의 실제 좌표(x, y, width, height) 추출
 *
 * 사용법:
 *   node scripts/extract-hotspots.js public/rooms/north.svg
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG 파일 경로
const svgPath = process.argv[2];
if (!svgPath) {
  console.error('❌ SVG 파일 경로를 지정하세요');
  console.error('  사용법: node scripts/extract-hotspots.js public/rooms/north.svg');
  process.exit(1);
}

const fullPath = path.resolve(svgPath);
if (!fs.existsSync(fullPath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${fullPath}`);
  process.exit(1);
}

const content = fs.readFileSync(fullPath, 'utf-8');

// SVG viewBox 추출
const viewBoxMatch = content.match(/viewBox="([\d\s.]+)"/);
if (!viewBoxMatch) {
  console.error('❌ viewBox를 찾을 수 없습니다');
  process.exit(1);
}

const viewBoxParts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
const viewWidth = viewBoxParts[2];
const viewHeight = viewBoxParts[3];
console.log(`📐 SVG viewBox: ${viewWidth} x ${viewHeight}\n`);

// rect 요소 추출 (data-hotspot 속성이 있는 것)
const rectRegex = /<rect[^>]*data-hotspot="([^"]*)"[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*width="([^"]*)"[^>]*height="([^"]*)"[^>]*>/g;

let match;
const hotspots = [];

while ((match = rectRegex.exec(content)) !== null) {
  const [, id, x, y, width, height] = match;

  // 퍼센티지를 실제 좌표로 변환 (viewBox 기준)
  const xNum = parseFloat(x);
  const yNum = parseFloat(y);
  const wNum = parseFloat(width);
  const hNum = parseFloat(height);

  // config 형식: [x%, y%, w%, h%]
  const configX = Math.round((xNum / viewWidth) * 100);
  const configY = Math.round((yNum / viewHeight) * 100);
  const configW = Math.round((wNum / viewWidth) * 100);
  const configH = Math.round((hNum / viewHeight) * 100);

  hotspots.push({
    id: id.trim(),
    actual: { x: Math.round(xNum), y: Math.round(yNum), w: Math.round(wNum), h: Math.round(hNum) },
    config: [configX, configY, configW, configH],
  });
}

if (hotspots.length === 0) {
  console.log('⚠️  data-hotspot 속성이 있는 rect 요소를 찾을 수 없습니다.');
  console.log('\n💡 SVG에 다음과 같이 추가하세요:');
  console.log('  <rect data-hotspot="hotspot-id" x="..." y="..." width="..." height="..." />');
  process.exit(0);
}

// 결과 출력
console.log('🎯 추출된 Hotspot 좌표:\n');
hotspots.forEach((hs) => {
  console.log(`📌 ${hs.id}`);
  console.log(`   실제 좌표: x=${hs.actual.x}, y=${hs.actual.y}, w=${hs.actual.w}, h=${hs.actual.h}`);
  console.log(`   config: [${hs.config.join(', ')}]`);
  console.log('');
});

// JSON 출력
console.log('\n📋 JSON 형식 (config에 복사):\n');
hotspots.forEach((hs) => {
  console.log(`    {`);
  console.log(`      id: '${hs.id}',`);
  console.log(`      area: [${hs.config.join(', ')}],`);
  console.log(`      label: '[LABEL]',`);
  console.log(`      action: { /* ... */ },`);
  console.log(`    },`);
});
