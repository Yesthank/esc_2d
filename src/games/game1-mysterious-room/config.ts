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
          area: [31, 63, 28, 9],
          label: '수상한 쪽지',
          action: { type: 'puzzle', puzzleId: 'quiz1-introvert' },
        },
        {
          id: 'desk-drawer',
          area: [36, 76, 28, 6],
          label: '책상 서랍',
          action: {
            type: 'examine',
            text: '서랍 안에 교수의 메모가 있다.\n"내가 사라지면, 이 방에서 답을 찾아라.\n모든 답은 글자 속에 숨어 있다.\n때로는 글자를 변환하면 답이 보인다.\n룸 곳곳의 물건들을 꼼꼼히 살펴보라."',
          },
        },
        {
          id: 'bookshelf',
          area: [4, 22, 36, 51],
          label: '책장',
          action: {
            type: 'examine',
            text: '언어학, 암호학, 수학 관련 책들이 빼곡하다.\n한 교수의 학문적 열정이 느껴진다.',
          },
        },
        {
          id: 'bookshelf-note',
          area: [7, 38, 18, 8],
          label: '책 사이에 낀 종이!',
          action: { type: 'puzzle', puzzleId: 'quiz2-shapes' },
          visibleWhen: { type: 'flag', flagId: 'quiz1-solved', value: true },
        },
        {
          id: 'lamp',
          area: [64, 50, 17, 13],
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
          area: [22, 3, 56, 34],
          label: '창문',
          action: {
            type: 'examine',
            text: '밤하늘에 초승달이 떠 있다.\n교수가 실종된 것도 이런 밤이었다고 한다...',
          },
        },
        {
          id: 'cabinet',
          area: [23, 41, 54, 35],
          label: '잠긴 캐비닛',
          action: {
            type: 'examine',
            text: '단단히 잠겨 있다.\n자물쇠에 "LOCK-7"이라는 제품 각인이 보인다.\n문제를 더 풀어야 열 수 있을 것 같다.',
          },
          activeWhen: { type: 'not-flag', flagId: 'quiz3-solved', value: true },
          failMessage: '아직 잠겨 있다. 다른 단서를 먼저 찾아보자.',
        },
        {
          id: 'cabinet-puzzle',
          area: [23, 41, 54, 35],
          label: '캐비닛 (뭔가 반응한다...)',
          action: { type: 'puzzle', puzzleId: 'quiz4-ink' },
          visibleWhen: { type: 'flag', flagId: 'quiz3-solved', value: true },
          activeWhen: { type: 'not-flag', flagId: 'quiz4-solved', value: true },
        },
        {
          id: 'cabinet-open',
          area: [23, 41, 54, 35],
          label: '열린 캐비닛',
          action: {
            type: 'dialog',
            dialogId: 'cabinet-opened',
          },
          visibleWhen: { type: 'flag', flagId: 'quiz4-solved', value: true },
        },
        {
          id: 'curtain',
          area: [14, 3, 5, 35],
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
          area: [21, 12, 58, 32],
          label: '벽난로',
          action: {
            type: 'examine',
            text: '불이 꺼진 벽난로.\n재 속에서 탄 종이 조각이 보인다... 하지만 읽을 수 없다.',
          },
          activeWhen: { type: 'not-flag', flagId: 'quiz4-solved', value: true },
        },
        {
          id: 'mantel-puzzle',
          area: [17, 7, 66, 7],
          label: '벽난로 위 선반 (뭔가 적혀 있다)',
          action: { type: 'puzzle', puzzleId: 'quiz6-gray' },
          visibleWhen: {
            type: 'and',
            conditions: [
              { type: 'flag', flagId: 'quiz3-solved', value: true },
              { type: 'not-flag', flagId: 'quiz6-solved', value: true },
            ],
          },
        },
        {
          id: 'fireplace-puzzle',
          area: [28, 24, 43, 20],
          label: '벽난로 (타다 남은 노트)',
          action: { type: 'puzzle', puzzleId: 'quiz5-ifthen' },
          visibleWhen: {
            type: 'and',
            conditions: [
              { type: 'flag', flagId: 'quiz6-solved', value: true },
              { type: 'not-flag', flagId: 'quiz5-solved', value: true },
            ],
          },
        },
        {
          id: 'door-locked',
          area: [16, 48, 44, 40],
          label: '출구 문',
          action: {
            type: 'examine',
            text: '문이 굳게 잠겨 있다.\n자물쇠에 4글자를 입력하는 장치가 달려 있다...',
          },
          activeWhen: { type: 'not-flag', flagId: 'quiz5-solved', value: true },
        },
        {
          id: 'door-unlocked',
          area: [16, 48, 44, 40],
          label: '출구 문 (자물쇠가 풀렸다!)',
          action: {
            type: 'dialog',
            dialogId: 'finale',
          },
          visibleWhen: { type: 'flag', flagId: 'quiz5-solved', value: true },
        },
        {
          id: 'coat-rack',
          area: [77, 52, 14, 35],
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
          area: [2, 40, 72, 20],
          label: '소파',
          action: {
            type: 'examine',
            text: '낡은 가죽 소파. 교수가 자주 여기 앉아 사색에 빠졌다고 한다.\n쿠션 아래에는... 접힌 종이가 있다!',
          },
          activeWhen: { type: 'not-flag', flagId: 'quiz2-solved', value: true },
        },
        {
          id: 'sofa-puzzle',
          area: [2, 40, 72, 20],
          label: '소파 쿠션 아래 종이',
          action: { type: 'puzzle', puzzleId: 'quiz3-flipped' },
          visibleWhen: { type: 'flag', flagId: 'quiz2-solved', value: true },
          activeWhen: { type: 'not-flag', flagId: 'quiz3-solved', value: true },
        },
        {
          id: 'sofa-done',
          area: [2, 40, 72, 20],
          label: '소파',
          action: {
            type: 'examine',
            text: '낡은 가죽 소파. 쿠션 아래의 종이는 이미 확인했다.',
          },
          visibleWhen: { type: 'flag', flagId: 'quiz3-solved', value: true },
        },
        {
          id: 'painting-wall',
          area: [5, 11, 86, 11],
          label: '벽에 걸린 사진들',
          action: {
            type: 'examine',
            text: '교수와 학생들의 사진이 여러 장 걸려 있다.\n모두 행복해 보이는 얼굴들... 교수에게 무슨 일이 있었던 걸까.',
          },
        },
        {
          id: 'clock',
          area: [70, 20, 22, 12],
          label: '벽시계',
          action: {
            type: 'examine',
            text: '시계가 3시 47분에서 멈춰 있다.\n아마 교수가 실종된 시각일 것이다...',
          },
        },
        {
          id: 'side-table',
          area: [80, 58, 15, 15],
          label: '사이드 테이블',
          action: {
            type: 'examine',
            text: '테이블 위에 다 식은 커피잔.\n잔 밑에 코스터... 코스터 뒷면에 뭔가 쓰여 있다.\n"답은 변환에 있다. I → E"',
          },
        },
        {
          id: 'rug',
          area: [8, 78, 70, 18],
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
      prompt: `낡은 종이에 교수의 필체로 적혀 있다.\n\n△ UNCLE\n□ TREATS\n⬠ BEAUTY\n\n<small>(영어 3글자)</small>`,
      answer: 'CAT',
      placeholder: '영어로 입력하세요',
      solvedFlag: 'quiz2-solved',
      reward: {
        type: 'flag',
        flagId: 'quiz2-solved',
        flagValue: true,
        text: '삼각형(3)→C, 사각형(4)→A, 오각형(5)→T\n→ CAT!\n\n종이 아래에 메모: "소파 쪽을 확인해라. 쿠션 아래를 뒤져봐."',
      },
    },
    // 문제 3: 뒤집어진 글자 (SELF_QUIZ_BANK #3)
    {
      id: 'quiz3-flipped',
      type: 'text-input',
      title: '교수의 세 번째 수수께끼',
      prompt: `소파 쿠션 아래서 찾은 접힌 종이.\n\n교수의 필체로 쓰여 있다:\n<pre style="font-size:1.2em; letter-spacing:2px">A - L\nL - ∋</pre>\n\n<small>정답은 한글로 입력하시오.</small>`,
      answer: '특급',
      placeholder: '한글로 입력하세요',
      isKorean: true,
      solvedFlag: 'quiz3-solved',
      reward: {
        type: 'flag',
        flagId: 'quiz3-solved',
        flagValue: true,
        text: '∋를 뒤집으면 ㅌ, L을 뒤집으면 ㄱ → 특\nL을 뒤집으면 ㄱ, A를 뒤집으면 ㅂ → 급\n→ 특급!\n\n종이 뒷면: "캐비닛의 자물쇠를 확인해라."',
      },
    },
    // 문제 4: 잉크에 피를 찍으면 (SELF_QUIZ_BANK #4)
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
        text: 'ink + P = Pink\nlock + B = Block!\n\n찰칵! 캐비닛이 열렸다!\n캐비닛 안을 살펴보자.',
      },
    },
    // 문제 6: 회색 숫자의 비밀 (SELF_QUIZ_BANK #6)
    {
      id: 'quiz6-gray',
      type: 'text-input',
      title: '벽난로 위의 수수께끼',
      prompt: `벽난로 선반 위에 교수가 새겨놓은 문구:\n\n<pre style="font-size:1.1em">F <span style="color:#999">4</span> E = 5\nS <span style="color:#999">9</span> = 6\nTA <span style="color:#999">10</span> = ???</pre>\n\n<small>(회색 숫자에 주목. 영어로 입력)</small>`,
      answer: 'TAX',
      placeholder: '영어로 입력하세요',
      solvedFlag: 'quiz6-solved',
      reward: {
        type: 'flag',
        flagId: 'quiz6-solved',
        flagValue: true,
        text: '회색 숫자를 로마 숫자로!\nF + IV + E = FIVE (5) ✓\nS + IX = SIX (6) ✓\nTA + X = TAX!\n\n벽난로 속 탄 종이가 이제 읽힐 것 같다...',
      },
    },
    // 문제 5: IF... THEN... (SELF_QUIZ_BANK #5) - 최종
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
      forPuzzle: 'quiz3-flipped',
      steps: [
        '글자들을 위아래로 뒤집어서 보세요.',
        '∋를 뒤집으면 한글 자음이 됩니다.',
        'ㅌ ㅡ ㄱ = 특, ㄱ ㅡ ㅂ = 급',
      ],
      visibleWhen: {
        type: 'and',
        conditions: [
          { type: 'flag', flagId: 'quiz2-solved', value: true },
          { type: 'not-flag', flagId: 'quiz3-solved', value: true },
        ],
      },
    },
    {
      forPuzzle: 'quiz4-ink',
      steps: [
        'ink에 "피"를 넣으면 Pink... 어디에 넣었을까요?',
        'ink 앞에 P를 붙이면 Pink! 같은 규칙으로...',
        '캐비닛 자물쇠에 LOCK이라고 적혀 있었죠? B + lock = ?',
      ],
      visibleWhen: {
        type: 'and',
        conditions: [
          { type: 'flag', flagId: 'quiz3-solved', value: true },
          { type: 'not-flag', flagId: 'quiz4-solved', value: true },
        ],
      },
    },
    {
      forPuzzle: 'quiz6-gray',
      steps: [
        '회색 숫자에 주목하세요. 4, 9, 10...',
        '이 숫자들을 로마 숫자로 바꿔보세요. 4=IV, 9=IX, 10=X',
        'F + IV + E = FIVE(5)! S + IX = SIX(6)! TA + X = ?',
      ],
      visibleWhen: {
        type: 'and',
        conditions: [
          { type: 'flag', flagId: 'quiz3-solved', value: true },
          { type: 'not-flag', flagId: 'quiz6-solved', value: true },
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
          { type: 'flag', flagId: 'quiz6-solved', value: true },
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
