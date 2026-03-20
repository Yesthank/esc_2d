#!/usr/bin/env node
/**
 * config의 hotspot 좌표와 SVG의 실제 요소 좌표를 비교
 *
 * 사용법:
 *   node scripts/validate-hotspots.js src/games/game1-mysterious-room/config.ts public/rooms/north.svg
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = process.argv[2];
const svgPath = process.argv[3];

if (!configPath || !svgPath) {
  console.error('❌ 경로를 지정하세요');
  console.error('  사용법: node scripts/validate-hotspots.js <config> <svg>');
  process.exit(1);
}

const configContent = fs.readFileSync(path.resolve(configPath), 'utf-8');
const svgContent = fs.readFileSync(path.resolve(svgPath), 'utf-8');

// SVG viewBox 추출
const viewBoxMatch = svgContent.match(/viewBox="([\d\s.]+)"/);
if (!viewBoxMatch) {
  console.error('❌ SVG viewBox를 찾을 수 없습니다');
  process.exit(1);
}

const viewBoxParts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
const viewWidth = viewBoxParts[2];
const viewHeight = viewBoxParts[3];

// SVG에서 data-hotspot 요소 추출
const svgRectRegex = /<rect[^>]*data-hotspot="([^"]*)"[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*width="([^"]*)"[^>]*height="([^"]*)"[^>]*>/g;
const svgHotspots = {};

let match;
while ((match = svgRectRegex.exec(svgContent)) !== null) {
  const [, id, x, y, width, height] = match;
  const xNum = parseFloat(x);
  const yNum = parseFloat(y);
  const wNum = parseFloat(width);
  const hNum = parseFloat(height);

  const configX = Math.round((xNum / viewWidth) * 100);
  const configY = Math.round((yNum / viewHeight) * 100);
  const configW = Math.round((wNum / viewWidth) * 100);
  const configH = Math.round((hNum / viewHeight) * 100);

  svgHotspots[id.trim()] = [configX, configY, configW, configH];
}

if (Object.keys(svgHotspots).length === 0) {
  console.warn('⚠️  SVG에 data-hotspot 속성이 없습니다');
  console.warn('💡 검증을 위해 SVG에 다음을 추가하세요:');
  console.warn('  <rect data-hotspot="hotspot-id" x="..." y="..." width="..." height="..." />');
  console.log('');
}

// config에서 hotspot 추출 (간단한 정규식)
const configHotspotRegex = /id:\s*['"]([\w-]+)['"][^}]*?area:\s*\[([\d,\s]+)\]/g;
const configHotspots = {};

while ((match = configHotspotRegex.exec(configContent)) !== null) {
  const [, id, coords] = match;
  configHotspots[id.trim()] = coords.split(',').map(x => parseInt(x.trim()));
}

console.log(`📐 비교 대상: SVG viewBox ${viewWidth}x${viewHeight}\n`);
console.log(`📋 config 파일: ${configPath}`);
console.log(`🖼️  SVG 파일: ${svgPath}\n`);

// 비교
console.log('🔍 검증 결과:\n');

let issues = 0;

// config에 있는 모든 hotspot 확인
for (const [id, configCoords] of Object.entries(configHotspots)) {
  const svgCoords = svgHotspots[id];

  if (!svgCoords) {
    console.log(`⚠️  ${id}`);
    console.log(`   config: [${configCoords.join(', ')}]`);
    console.log(`   SVG에서 찾을 수 없음 (data-hotspot="${id}" 추가 필요)\n`);
    issues++;
    continue;
  }

  const diff = configCoords.map((v, i) => Math.abs(v - svgCoords[i]));
  const maxDiff = Math.max(...diff);

  if (maxDiff <= 1) {
    console.log(`✅ ${id}`);
    console.log(`   config: [${configCoords.join(', ')}]`);
    console.log(`   SVG:    [${svgCoords.join(', ')}] ✓\n`);
  } else {
    console.log(`❌ ${id} (차이: ${maxDiff}%)`);
    console.log(`   config: [${configCoords.join(', ')}]`);
    console.log(`   SVG:    [${svgCoords.join(', ')}]`);
    console.log(`   → 수정: [${svgCoords.join(', ')}]\n`);
    issues++;
  }
}

// SVG에는 있지만 config에 없는 것
for (const id of Object.keys(svgHotspots)) {
  if (!configHotspots[id]) {
    console.log(`🔔 ${id}`);
    console.log(`   SVG: [${svgHotspots[id].join(', ')}]`);
    console.log(`   config에 없음 (추가 필요)\n`);
    issues++;
  }
}

console.log(`\n${issues === 0 ? '✅ 모든 hotspot이 일치합니다!' : `⚠️  ${issues}개의 불일치가 있습니다`}`);
