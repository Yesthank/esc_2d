# 🎯 Hotspot 좌표 정렬 가이드

새 게임을 만들거나 기존 게임의 hotspot을 수정할 때 사용하세요.

## 개요

- **config.ts**: JavaScript 코드에서 hotspot 좌표 정의 (`area: [x%, y%, w%, h%]`)
- **SVG**: 실제 배경 이미지에 클릭 영역 마크업
- **검증**: 좌표가 일치하는지 자동 확인

### Hotspot 좌표 시스템

```
area: [x, y, width, height]
      └─ 모두 viewBox 기준의 백분율 (0~100)
```

예: `area: [30, 63, 28, 10]`
- x: 화면 왼쪽에서 30% 위치
- y: 화면 위쪽에서 63% 위치
- width: 화면 너비의 28%
- height: 화면 높이의 10%

---

## 🔧 Step 1: SVG에 hotspot 마킹

SVG 파일에 `data-hotspot` 속성이 있는 `<rect>` 요소를 추가하세요.

### 예시

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280">
  <!-- 배경, 그래픽 등... -->

  <!-- Hotspot 마킹 (투명, 클릭 가능 영역) -->
  <rect
    data-hotspot="desk-note"
    x="216" y="806" width="201" height="128"
    fill="none"
    style="pointer-events: auto; cursor: pointer"
  />

  <rect
    data-hotspot="bookshelf"
    x="29" y="282" width="259" height="651"
    fill="none"
    style="pointer-events: auto; cursor: pointer"
  />
</svg>
```

**중요:**
- `data-hotspot="hotspot-id"`: config.ts의 id와 정확히 일치해야 함
- `x`, `y`, `width`, `height`: SVG viewBox 좌표계에서의 실제 픽셀
- `fill="none"`: 보이지 않음 (개발 중에는 `fill="rgba(255,0,0,0.2)"` 추가 가능)

---

## 🔍 Step 2: 좌표 추출

SVG에 마킹한 hotspot의 좌표를 추출하여 config.ts에 맞는 형식으로 변환합니다.

```bash
node scripts/extract-hotspots.js public/rooms/north.svg
```

**출력 예시:**

```
📐 SVG viewBox: 720 x 1280

🎯 추출된 Hotspot 좌표:

📌 desk-note
   실제 좌표: x=216, y=806, w=201, h=128
   config: [30, 63, 28, 10]

📌 bookshelf
   실제 좌표: x=29, y=282, w=259, h=651
   config: [4, 22, 36, 51]
```

**스크립트가 출력한 `config` 배열을 config.ts의 hotspots에 복사합니다.**

---

## ✅ Step 3: 검증

config.ts의 좌표와 SVG의 실제 좌표가 일치하는지 확인합니다.

```bash
node scripts/validate-hotspots.js \
  src/games/game1-mysterious-room/config.ts \
  public/rooms/north.svg
```

**성공 출력:**

```
✅ desk-note
   config: [30, 63, 28, 10]
   SVG:    [30, 63, 28, 10] ✓

✅ bookshelf
   config: [4, 22, 36, 51]
   SVG:    [4, 22, 36, 51] ✓

✅ 모든 hotspot이 일치합니다!
```

**차이 발견 시:**

```
❌ desk-note (차이: 2%)
   config: [30, 63, 28, 10]
   SVG:    [32, 65, 28, 10]
   → 수정: [32, 65, 28, 10]
```

config.ts를 수정합니다.

---

## 📋 워크플로우

### 새 게임 추가할 때

1. **Figma/일러스트에서 SVG 생성**
   - viewBox 크기 확인: 보통 `0 0 720 1280` (세로)

2. **SVG에 hotspot 마킹**
   ```bash
   # 각 클릭 가능 영역에 <rect data-hotspot="id"> 추가
   ```

3. **좌표 추출**
   ```bash
   node scripts/extract-hotspots.js public/rooms/[이름].svg
   ```

4. **config.ts 작성**
   - 추출한 배열을 복사
   - label, action 채우기

5. **검증**
   ```bash
   node scripts/validate-hotspots.js src/games/[게임]/config.ts public/rooms/[이름].svg
   ```

6. **모든 방에 반복**

---

## 🎨 Figma에서 좌표 얻기

Figma의 각 요소를 선택하면:
- **X, Y, W, H** 정보가 오른쪽 패널에 표시됨
- **SVG 내보내기** → 자동으로 정확한 좌표 포함
- 각 요소에 이름 지정 → SVG의 id로 변환 가능

**팁:** Figma → "Export" → "SVG" → 설정에서 "Include 'id' attribute" 체크

---

## 🔗 현재 게임 (game1-mysterious-room) 상태

모든 방의 hotspot이 검증됨 ✅

```bash
# 확인 방법
npm run validate:hotspots
```

---

## 🐛 트러블슈팅

### Q: 스크립트가 hotspot을 찾지 못해요

**A:** SVG에 `data-hotspot` 속성이 있는지 확인

```xml
❌ <rect x="..." y="..." />
✅ <rect data-hotspot="id" x="..." y="..." />
```

### Q: 좌표가 자꾸 어긋나요

**A:** SVG viewBox가 일치하는지 확인

```xml
<!-- 일관성 있게 -->
<svg viewBox="0 0 720 1280">
```

### Q: 모바일에서 핫스팟이 맞지 않아요

**A:** `Room.tsx`의 스케일링 로직 확인. config 좌표는 viewBox 기준이므로, 렌더링 시 현재 스크린 크기에 따라 자동 스케일됨.

---

## 📚 참고

- `src/engine/components/Room.tsx`: hotspot 렌더링 로직
- `src/games/game1-mysterious-room/config.ts`: 실제 예시
- `public/rooms/*.svg`: 현재 배경들
