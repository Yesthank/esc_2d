# 방탈출 게임 엔진 (esc_2d)

## 프로젝트 개요
React + Vite + TypeScript 기반 2D 포인트앤클릭 방탈출 게임 엔진.
**데이터(config) 주도 설계** — 코드 수정 없이 config.ts + SVG만 추가하면 새 게임 생성.

## 기술 스택
- React 19 + TypeScript + Vite
- GitHub Pages 자동 배포 (Actions workflow)
- SVG 기반 배경 (향후 PNG/일러스트 교체 가능)

## 디렉토리 구조
```
src/
├── engine/                    # 게임 엔진 (재사용)
│   ├── types.ts               # 모든 데이터 타입 정의
│   ├── utils.ts               # assetUrl 등 유틸
│   ├── GameRunner.tsx/.css     # 메인 게임 컨트롤러
│   ├── hooks/
│   │   ├── useGameState.ts    # 상태 관리 (reducer)
│   │   └── useTimer.ts        # 카운트다운 타이머
│   └── components/
│       ├── Room.tsx/.css       # 방 렌더러 + 핫스팟 + 방향 화살표
│       ├── PuzzleModal.tsx/.css # 퍼즐 UI (keypad, text-input, sequence)
│       ├── DialogModal.tsx/.css # 스토리 대화창
│       ├── Inventory.tsx/.css  # 인벤토리 바
│       ├── HUD.tsx/.css        # 상단 HUD (방이름, 타이머, 힌트)
│       ├── MessageBox.tsx/.css # 메시지 박스
│       ├── ExamineModal.tsx    # 조사 모달
│       └── GameClearModal.tsx/.css # 클리어 화면
├── games/                     # 개별 게임 데이터
│   └── game1-mysterious-room/
│       └── config.ts          # 게임 설정 (방, 퍼즐, 스토리, 힌트)
├── App.tsx                    # 로비 (게임 선택)
└── main.tsx                   # 엔트리포인트
public/
└── rooms/                     # SVG 배경 이미지
    ├── north.svg / north-solved.svg
    ├── east.svg / east-solved.svg
    ├── south.svg / south-solved.svg
    └── west.svg
```

## 새 게임 만드는 방법
1. `src/games/game2-xxx/config.ts` 생성 (GameConfig 타입 따름)
2. `public/rooms/` 에 SVG 배경 추가
3. `src/App.tsx`의 games 배열에 import 추가

## 핵심 규칙
- **퍼즐 문제는 직접 만들지 말 것** — `SELF_QUIZ_BANK.md`에서 가져다 사용
- 배경 경로는 `/rooms/xxx.svg` 형태로 (assetUrl이 base 자동 적용)
- `backgroundVariants`로 퍼즐 풀면 배경 자동 교체
- `nav: { left, right, back }`으로 4방향 탐색
- `entryDialog`로 방 입장 시 스토리 대화 재생
- `visibleWhen`/`activeWhen`으로 핫스팟 조건부 표시

## 퍼즐 타입
- `text-input`: 텍스트 정답 입력 (한글/영문)
- `keypad`: 숫자 입력 (N자리)
- `sequence`: 순서 맞추기

## 개발 서버
```bash
npm install
npm run dev
```

## 빌드 & 배포
- `npm run build` → dist/ 생성
- main push 시 GitHub Actions가 자동 배포
- base URL: `/esc_2d/` (vite.config.ts)

## 현재 게임 "수상한 서재"
실종된 언어학자의 서재에서 탈출. SELF_QUIZ_BANK 6문제 전부 사용.
퍼즐 흐름: 문제1(지옥) → 문제2(CAT) → 문제3(특급) → 문제4(BLOCK) → 문제6(TAX) → 문제5(HEAT) → 탈출
