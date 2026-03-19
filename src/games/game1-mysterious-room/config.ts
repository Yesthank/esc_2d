import type { GameConfig } from '../../engine/types';

/**
 * 게임 1: 수상한 서재
 *
 * [스토리]
 * 유명한 언어학자 "한세진 교수"가 실종됐다.
 * 마지막 목격 장소인 그의 서재에 잠입한 당신.
 * 그런데 문이 잠겨버렸다. 서재 곳곳에 교수가 남긴 수수께끼들...
 * 이건 단순한 퍼즐이 아니다. 교수의 마지막 메시지를 해독해야 한다.
 *
 * [구조: 4방향]
 * - 정면(north): 책장 + 책상 (쪽지 퍼즐)
 * - 오른쪽(east): 창문 + 캐비닛 (캐비닛 퍼즐)
 * - 뒤쪽(south): 출구 문 + 벽난로 (최종 퍼즐)
 * - 왼쪽(west): 벽면 액자 + 소파 (액자 퍼즐)
 *
 * SELF_QUIZ_BANK 문제 활용:
 * - 문제 1: 내향인이 외향형으로 → 정답: 지옥
 * - 문제 2: 도형 + 글자 → 정답: CAT
 * - 문제 4: 잉크에 피를 찍으면 → 정답: BLOCK
 * - 문제 5: IF... THEN... → 정답: HEAT
 */
const config: GameConfig = {
  id: 'game1-mysterious-room',
  title: '수상한 서재',
  description: '실종된 언어학자의 서재. 그가 남긴 수수께끼를 풀고 진실을 밝혀라.',
  timeLimit: 1200,
  startRoom: 'north',

  rooms: [
    // ====== 정면: 책장 + 책상 ======
    {
      id: 'north',
      name: '서재 · 책장 쪽',
      background: '/rooms/north.svg',
      backgroundVariants: [
        {
          when: { type: 'flag', flagId: 'quiz1-solved', value: true },
          background: '/rooms/north-solved.svg',
        },
      ],
      entryDialog: 'intro',
      nav: { left: 'west', right: 'east' },
      hotspots: [
        {
          id: 'desk-note',
          area: [48, 52, 22, 18],
          label: '수상한 쪽지',
          action: { type: 'puzzle', puzzleId: 'quiz1-introvert' },
        },
        {
          id: 'desk-drawer',
          area: [48, 82, 20, 7],
          label: '책상 서랍',
          action: {
            type: 'examine',
            text: '서랍 안에 교수의 메모가 있다.\n"내가 사라지면, 이 방에서 답을 찾아라.\n모든 답은 글자 속에 숨어 있다."',
          },
        },
        {
          id: 'bookshelf',
          area: [0, 0, 26, 90],
          label: '책장',
          action: {
            type: 'examine',
            text: '언어학, 암호학, 수학 관련 책들이 빼곡하다.\n한 교수의 학문적 열정이 느껴진다.',
          },
        },
        {
          id: 'bookshelf-note',
          area: [12, 33, 10, 10],
          label: '책 사이에 낀 종이!',
          action: { type: 'puzzle', puzzleId: 'quiz2-shapes' },
          visibleWhen: { type: 'flag', flagId: 'quiz1-solved', value: true },
        },
        {
          id: 'lamp',
          area: [72, 28, 14, 28],
          label: '책상 램프',
          action: {
            type: 'examine',
            text: '따뜻한 빛을 내는 오래된 램프.\n램프 아래, 교수가 항상 앉아 연구하던 자리다.',
          },
        },
      ],
    },

    // ====== 오른쪽: 창문 + 캐비닛 ======
    {
      id: 'east',
      name: '서재 · 창문 쪽',
      background: '/rooms/east.svg',
      backgroundVariants: [
        {
          when: { type: 'flag', flagId: 'quiz4-solved', value: true },
          background: '/rooms/east-solved.svg',
        },
      ],
      nav: { left: 'north', right: 'south' },
      hotspots: [
        {
          id: 'window',
          area: [8, 5, 35, 52],
          label: '창문',
          action: {
            type: 'examine',
            text: '밤하늘에 초승달이 떠 있다.\n교수가 실종된 것도 이런 밤이었다고 한다...',
          },
        },
        {
          id: 'cabinet',
          area: [50, 8, 30, 65],
          label: '잠긴 캐비닛',
          action: {
            type: 'examine',
            text: '단단히 잠겨 있다.\n문제를 더 풀어야 열 수 있을 것 같다.',
          },
          activeWhen: { type: 'not-flag', flagId: 'quiz2-solved', value: true },
          failMessage: '아직 잠겨 있다. 다른 단서를 먼저 찾아보자.',
        },
        {
          id: 'cabinet-puzzle',
          area: [50, 8, 30, 65],
          label: '캐비닛 (뭔가 반응한다...)',
          action: { type: 'puzzle', puzzleId: 'quiz4-ink' },
          visibleWhen: { type: 'flag', flagId: 'quiz2-solved', value: true },
          activeWhen: { type: 'not-flag', flagId: 'quiz4-solved', value: true },
        },
        {
          id: 'cabinet-open',
          area: [50, 8, 30, 65],
          label: '열린 캐비닛',
          action: {
            type: 'dialog',
            dialogId: 'cabinet-opened',
          },
          visibleWhen: { type: 'flag', flagId: 'quiz4-solved', value: true },
        },
        {
          id: 'curtain',
          area: [5, 5, 8, 45],
          label: '커튼',
          action: {
            type: 'examine',
            text: '무거운 벨벳 커튼. 살짝 들추니 먼지가 날린다.',
          },
        },
      ],
    },

    // ====== 뒤쪽: 출구 문 + 벽난로 ======
    {
      id: 'south',
      name: '서재 · 출구 쪽',
      background: '/rooms/south.svg',
      backgroundVariants: [
        {
          when: { type: 'flag', flagId: 'quiz5-solved', value: true },
          background: '/rooms/south-solved.svg',
        },
      ],
      nav: { left: 'east', right: 'west' },
      hotspots: [
        {
          id: 'fireplace',
          area: [2, 8, 32, 62],
          label: '벽난로',
          action: {
            type: 'examine',
            text: '불이 꺼진 벽난로.\n재 속에서 탄 종이 조각이 보인다... 하지만 읽을 수 없다.',
          },
          activeWhen: { type: 'not-flag', flagId: 'quiz4-solved', value: true },
        },
        {
          id: 'fireplace-puzzle',
          area: [2, 8, 32, 62],
          label: '벽난로 (타다 남은 노트)',
          action: { type: 'puzzle', puzzleId: 'quiz5-ifthen' },
          visibleWhen: { type: 'flag', flagId: 'quiz4-solved', value: true },
          activeWhen: { type: 'not-flag', flagId: 'quiz5-solved', value: true },
        },
        {
          id: 'door-locked',
          area: [40, 3, 28, 72],
          label: '출구 문',
          action: {
            type: 'examine',
            text: '문이 굳게 잠겨 있다.\n자물쇠에 4글자를 입력하는 장치가 달려 있다...',
          },
          activeWhen: { type: 'not-flag', flagId: 'quiz5-solved', value: true },
        },
        {
          id: 'door-unlocked',
          area: [40, 3, 28, 72],
          label: '출구 문 (자물쇠가 풀렸다!)',
          action: {
            type: 'dialog',
            dialogId: 'finale',
          },
          visibleWhen: { type: 'flag', flagId: 'quiz5-solved', value: true },
        },
        {
          id: 'coat-rack',
          area: [34, 8, 10, 55],
          label: '코트걸이',
          action: {
            type: 'examine',
            text: '교수의 코트가 아직 걸려 있다.\n주머니에서 아무것도 나오지 않는다.',
          },
        },
      ],
    },

    // ====== 왼쪽: 벽면 액자 + 소파 ======
    {
      id: 'west',
      name: '서재 · 소파 쪽',
      background: '/rooms/west.svg',
      nav: { left: 'south', right: 'north' },
      hotspots: [
        {
          id: 'sofa',
          area: [3, 35, 32, 30],
          label: '소파',
          action: {
            type: 'examine',
            text: '낡은 가죽 소파. 교수가 자주 여기 앉아 사색에 빠졌다고 한다.\n쿠션 아래에는 아무것도 없다.',
          },
        },
        {
          id: 'painting-wall',
          area: [28, 10, 30, 28],
          label: '벽에 걸린 사진들',
          action: {
            type: 'examine',
            text: '교수와 학생들의 사진이 여러 장 걸려 있다.\n모두 행복해 보이는 얼굴들... 교수에게 무슨 일이 있었던 걸까.',
          },
        },
        {
          id: 'clock',
          area: [56, 8, 12, 20],
          label: '벽시계',
          action: {
            type: 'examine',
            text: '시계가 3시 47분에서 멈춰 있다.\n아마 교수가 실종된 시각일 것이다...',
          },
        },
        {
          id: 'side-table',
          area: [42, 48, 14, 18],
          label: '사이드 테이블',
          action: {
            type: 'examine',
            text: '테이블 위에 다 식은 커피잔.\n잔 밑에 코스터... 코스터 뒷면에 뭔가 쓰여 있다.\n"답은 변환에 있다. I → E"',
          },
        },
        {
          id: 'rug',
          area: [10, 78, 55, 10],
          label: '페르시아 러그',
          action: {
            type: 'examine',
            text: '아름다운 페르시아 러그.\n가장자리가 살짝 접혀 있지만, 아래에는 아무것도 없다.',
          },
        },
      ],
    },
  ],

  // ====== 대화 ======
  dialogs: [
    {
      id: 'intro',
      lines: [
        { text: '...' },
        { text: '여기가 한세진 교수의 서재인가.' },
        { text: '3일 전, 교수는 갑자기 사라졌다.\n"위험한 것을 알아버렸다"는 마지막 전화만 남기고.' },
        { text: '서재 문이... 잠겼다?\n안에서 잠긴 건가, 밖에서 잠긴 건가.' },
        { text: '책상 위에 뭔가 쪽지가 있다.\n교수가 남긴 것 같다... 살펴보자.' },
      ],
    },
    {
      id: 'cabinet-opened',
      lines: [
        { text: '캐비닛이 열렸다!' },
        { text: '안에 교수의 연구 노트가 있다...\n대부분 찢겨져 있지만, 한 페이지가 남아 있다.' },
        { text: '"이 방의 문을 잠근 건 나다.\n누군가 쫓아오고 있다.\n이 수수께끼를 풀 수 있는 건 내 제자뿐이다."' },
        { text: '교수님... 대체 무슨 일에 휘말린 거야.' },
        { text: '벽난로 쪽에 탄 종이가 보인다.\n아까는 읽을 수 없었는데... 노트의 내용이 힌트가 될지도.' },
      ],
    },
    {
      id: 'finale',
      lines: [
        { text: '자물쇠가 풀렸다! 문이 열린다...!' },
        { text: '문 뒤에 봉투 하나가 떨어져 있다.' },
        { text: '"여기까지 온 너에게.\n나는 안전한 곳에 있다. 걱정하지 마라.\n하지만 이 서재의 비밀은 반드시 지켜야 한다."' },
        { text: '"네가 풀어낸 수수께끼들 하나하나가\n바로 내 연구의 핵심이었다.\n글자 속에 숨은 진실... 그것이 내 평생의 연구였다."' },
        {
          text: '"고맙다, 제자여. 다시 만날 날을 기다린다."',
          setFlag: { flagId: 'escaped', value: true },
        },
      ],
    },
  ],

  // ====== 퍼즐 ======
  puzzles: [
    {
      id: 'quiz1-introvert',
      type: 'text-input',
      title: '교수의 첫 번째 수수께끼',
      prompt: `소심한 <strong>핀</strong>은 혼자 박혀 있지만 <strong>펜</strong>은 모두에게 말을 걸고,\n<strong>언덕</strong>은 묵묵히 서 있지만 <strong>ㅇㅇ</strong>은 시끄럽게 온 세상을 뒤흔든다.\n\nㅇㅇ에 들어갈 말은?`,
      answer: '지옥',
      placeholder: '한글로 입력하세요',
      isKorean: true,
      solvedFlag: 'quiz1-solved',
      reward: {
        type: 'flag',
        flagId: 'quiz1-solved',
        flagValue: true,
        text: '핀(PIN)의 I를 E로 바꾸면 펜(PEN)...\n언덕(HILL)의 I를 E로 바꾸면 지옥(HELL)!\n\n쪽지 뒷면: "잘 했다. 다음 단서는 책장 사이에 있다."',
      },
    },
    {
      id: 'quiz2-shapes',
      type: 'text-input',
      title: '교수의 두 번째 수수께끼',
      prompt: `도형이 숫자를 의미한다면...\n\n△ UNCLE\n□ TREATS\n⬠ BEAUTY\n\n세 도형이 가리키는 글자를 모으면?\n<small>(영어 3글자)</small>`,
      answer: 'CAT',
      placeholder: '영어로 입력하세요',
      solvedFlag: 'quiz2-solved',
      reward: {
        type: 'flag',
        flagId: 'quiz2-solved',
        flagValue: true,
        text: '삼각형(3)→C, 사각형(4)→A, 오각형(5)→T\n→ CAT!\n\n종이 아래에 메모: "캐비닛 잠금 장치를 확인해라."',
      },
    },
    {
      id: 'quiz4-ink',
      type: 'text-input',
      title: '캐비닛의 수수께끼',
      prompt: `캐비닛 잠금 장치에 문구가 새겨져 있다.\n\n잉크에 <span style="color:#e74c3c">피</span>를 찍으니 <span style="color:#ff69b4">분홍색</span>이 되었다.\n자물쇠가 비에 맞으면?\n\n<small>(영어로 입력)</small>`,
      answer: 'BLOCK',
      placeholder: '영어로 입력하세요',
      solvedFlag: 'quiz4-solved',
      reward: {
        type: 'flag',
        flagId: 'quiz4-solved',
        flagValue: true,
        text: 'ink + P = Pink\nlock + B = Block!\n\n찰칵! 캐비닛이 열렸다!',
      },
    },
    {
      id: 'quiz5-ifthen',
      type: 'text-input',
      title: '교수의 마지막 수수께끼',
      prompt: `벽난로 속에서 건진 반쯤 탄 노트.\n글씨가 겨우 보인다...\n\n<strong>IF</strong>   FISH, LIST, VISA, RISE\n<strong>THEN</strong> FRVL = ?\n\n<small>이것이 출구 문의 비밀번호다. (영어 4글자)</small>`,
      answer: 'HEAT',
      placeholder: '영어 4글자를 입력하세요',
      solvedFlag: 'quiz5-solved',
      reward: {
        type: 'flag',
        flagId: 'quiz5-solved',
        flagValue: true,
        text: 'F-IS-H → F=H, L-IS-T → L=T\nV-IS-A → V=A, R-IS-E → R=E\nFRVL → HEAT!\n\n...문 쪽에서 기계음이 들린다!',
      },
    },
  ],

  items: [],

  hints: [
    {
      forPuzzle: 'quiz1-introvert',
      steps: [
        '핀과 펜... 영어로 생각해보세요.',
        'PIN → PEN. 어떤 글자가 바뀌었나요?',
        'I가 E로 바뀌었어요. 언덕(HILL)도 같은 규칙을 적용하면?',
      ],
      visibleWhen: { type: 'not-flag', flagId: 'quiz1-solved', value: true },
    },
    {
      forPuzzle: 'quiz2-shapes',
      steps: [
        '도형의 변의 수를 세어보세요.',
        '삼각형=3, 사각형=4, 오각형=5. 이 숫자가 뭘 의미할까요?',
        '각 단어에서 n번째 글자를 뽑으면 됩니다.',
      ],
      visibleWhen: {
        type: 'and',
        conditions: [
          { type: 'flag', flagId: 'quiz1-solved', value: true },
          { type: 'not-flag', flagId: 'quiz2-solved', value: true },
        ],
      },
    },
    {
      forPuzzle: 'quiz4-ink',
      steps: [
        'ink에 "피"를 넣으면 Pink... 어디에 넣었을까요?',
        'ink 앞에 P를 붙이면 Pink! 같은 규칙으로...',
        'lock 앞에 B를 붙이면? B + lock = ?',
      ],
      visibleWhen: {
        type: 'and',
        conditions: [
          { type: 'flag', flagId: 'quiz2-solved', value: true },
          { type: 'not-flag', flagId: 'quiz4-solved', value: true },
        ],
      },
    },
    {
      forPuzzle: 'quiz5-ifthen',
      steps: [
        'FISH 안에 숨겨진 단어를 찾아보세요.',
        'F-IS-H... "IS"가 보이나요? F IS H = F는 H다!',
        '같은 규칙: F=H, L=T, V=A, R=E. FRVL의 각 글자를 치환하면?',
      ],
      visibleWhen: {
        type: 'and',
        conditions: [
          { type: 'flag', flagId: 'quiz4-solved', value: true },
          { type: 'not-flag', flagId: 'quiz5-solved', value: true },
        ],
      },
    },
  ],

  clearCondition: {
    type: 'flag',
    flagId: 'escaped',
    value: true,
  },
  clearMessage: '교수의 수수께끼를 모두 풀어냈다.\n그는 안전하다. 그리고 그의 연구는 당신에게 맡겨졌다.',
};

export default config;
