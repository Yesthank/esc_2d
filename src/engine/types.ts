// ============================================
// 방탈출 게임 엔진 - 데이터 타입 정의
// 새 게임을 만들 때 이 타입에 맞춰 config를 작성하면 됨
// ============================================

/** 클릭 가능한 영역 (핫스팟) */
export interface Hotspot {
  id: string;
  /** [x%, y%, width%, height%] - 배경 이미지 대비 퍼센트 좌표 */
  area: [number, number, number, number];
  /** 커서 올렸을 때 표시할 이름 */
  label?: string;
  /** 클릭 시 동작 */
  action: HotspotAction;
  /** 이 핫스팟이 보이려면 충족해야 할 조건 */
  visibleWhen?: Condition;
  /** 클릭 가능 조건 */
  activeWhen?: Condition;
  /** 조건 미충족 시 표시할 메시지 */
  failMessage?: string;
}

export type HotspotAction =
  | { type: 'examine'; text: string; image?: string }
  | { type: 'pickup'; itemId: string; text?: string }
  | { type: 'puzzle'; puzzleId: string }
  | { type: 'move'; roomId: string }
  | { type: 'use-item'; requiredItem: string; successAction: HotspotAction; text?: string }
  | { type: 'dialog'; dialogId: string }
  | { type: 'trigger'; flagId: string; value: string | boolean; text?: string };

/** 조건 */
export interface Condition {
  type: 'flag' | 'item' | 'not-flag' | 'not-item' | 'and' | 'or';
  flagId?: string;
  value?: string | boolean;
  itemId?: string;
  conditions?: Condition[];
}

/** 방 (씬) - 각 방은 여러 방향(view)을 가질 수 있음 */
export interface Room {
  id: string;
  name: string;
  /** 기본 배경 이미지 */
  background: string;
  /** 조건에 따라 바뀌는 배경 (퍼즐 풀면 서랍 열린 배경 등) */
  backgroundVariants?: { when: Condition; background: string }[];
  hotspots: Hotspot[];
  entryText?: string;
  entryFlag?: { flagId: string; value: string | boolean };
  /** 인접 방향 (화살표로 이동 가능) */
  nav?: {
    left?: string;   // 왼쪽 바라볼 때 이동할 room id
    right?: string;  // 오른쪽
    back?: string;   // 뒤돌아보기
  };
  /** 입장 시 자동 재생할 대화 (최초 1회) */
  entryDialog?: string;
}

/** 퍼즐 공통 */
export interface PuzzleBase {
  id: string;
  reward?: PuzzleReward;
  solvedFlag?: string;
  title?: string;
}

/** 키패드 (숫자 입력) */
export interface KeypadPuzzle extends PuzzleBase {
  type: 'keypad';
  answer: string;
  digits: number;
}

/** 텍스트 입력형 (한글/영문 정답 입력) */
export interface TextInputPuzzle extends PuzzleBase {
  type: 'text-input';
  /** 퍼즐 설명/문제 텍스트 (마크다운 가능) */
  prompt: string;
  /** 문제에 표시할 이미지 */
  image?: string;
  /** 정답 (대소문자 무시) */
  answer: string;
  /** 입력 힌트 (placeholder) */
  placeholder?: string;
  /** 정답이 한글인지 */
  isKorean?: boolean;
}

/** 패턴 (그리드 클릭) */
export interface PatternPuzzle extends PuzzleBase {
  type: 'pattern';
  gridSize: number;
  answer: number[];
}

/** 순서 맞추기 */
export interface SequencePuzzle extends PuzzleBase {
  type: 'sequence';
  answer: string[];
  options: { id: string; label: string; image?: string }[];
}

/** 슬라이더 퍼즐 */
export interface SliderPuzzle extends PuzzleBase {
  type: 'slider';
  gridSize: number;
  image: string;
}

export type Puzzle = KeypadPuzzle | TextInputPuzzle | PatternPuzzle | SequencePuzzle | SliderPuzzle;

export interface PuzzleReward {
  type: 'item' | 'flag' | 'both';
  itemId?: string;
  flagId?: string;
  flagValue?: string | boolean;
  text?: string;
}

/** 인벤토리 아이템 */
export interface Item {
  id: string;
  name: string;
  icon: string;
  description?: string;
  combinableWith?: string;
  combineResult?: string;
}

/** 대화 */
export interface Dialog {
  id: string;
  lines: DialogLine[];
}

export interface DialogLine {
  speaker?: string;
  text: string;
  setFlag?: { flagId: string; value: string | boolean };
}

/** 힌트 */
export interface Hint {
  forPuzzle?: string;
  steps: string[];
  visibleWhen?: Condition;
}

/** 게임 전체 설정 */
export interface GameConfig {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  timeLimit: number;
  startRoom: string;
  rooms: Room[];
  puzzles: Puzzle[];
  items: Item[];
  dialogs?: Dialog[];
  hints?: Hint[];
  clearCondition: Condition;
  clearMessage?: string;
}

/** 런타임 게임 상태 */
export interface GameState {
  currentRoom: string;
  inventory: string[];
  flags: Record<string, string | boolean>;
  solvedPuzzles: string[];
  visitedRooms: string[];
  hintsUsed: number;
  startTime: number;
  isCleared: boolean;
  isFailed: boolean;
  activeModal: ModalState | null;
  messageQueue: string[];
}

export type ModalState =
  | { type: 'examine'; text: string; image?: string }
  | { type: 'puzzle'; puzzleId: string }
  | { type: 'dialog'; dialogId: string }
  | { type: 'inventory-detail'; itemId: string }
  | { type: 'game-clear' }
  | { type: 'game-over' };
