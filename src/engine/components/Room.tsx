import { useEffect, useRef, useState } from 'react';
import type { Room as RoomType, GameState, Condition, HotspotAction } from '../types';
import { checkCondition } from '../hooks/useGameState';
import { assetUrl } from '../utils';
import './Room.css';

interface Props {
  room: RoomType;
  state: GameState;
  onHotspotClick: (action: HotspotAction) => void;
  onShowMessage: (text: string) => void;
  onNavigate: (roomId: string) => void;
  onDialog?: (dialogId: string) => void;
  selectedItem: string | null;
}

/** SVG 좌표 공간 - 세로(모바일 우선) */
const VB_W = 720;
const VB_H = 1280;

export function Room({ room, state, onHotspotClick, onShowMessage, onNavigate, onDialog, selectedItem: _selectedItem }: Props) {
  void _selectedItem; // 향후 아이템 사용 기능에서 활용
  const shownEntryRef = useRef<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isVisible = (condition?: Condition) => {
    if (!condition) return true;
    return checkCondition(condition, state);
  };

  const currentBg = (() => {
    if (room.backgroundVariants) {
      for (const variant of room.backgroundVariants) {
        if (checkCondition(variant.when, state)) {
          return assetUrl(variant.background);
        }
      }
    }
    return assetUrl(room.background);
  })();

  useEffect(() => {
    if (!shownEntryRef.current.has(room.id)) {
      shownEntryRef.current.add(room.id);
      if (room.entryDialog && onDialog) {
        onDialog(room.entryDialog);
      } else if (room.entryText) {
        onShowMessage(room.entryText);
      }
    }
  }, [room.id]);

  const visibleHotspots = room.hotspots.filter(hs => isVisible(hs.visibleWhen));

  return (
    <div className="room">
      <div className="room__viewport">
        {/* 단일 SVG: 배경 + 핫스팟 모두 동일 viewBox(0 0 720 1280)에 배치
            → preserveAspectRatio가 이미지와 핫스팟을 한 번에 스케일하므로
              어떤 화면 비율에서도 완벽 정렬 */}
        <svg
          className="room__svg-overlay"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 배경을 SVG <image>로 임베드 — <img>와 별도 스케일 문제 원천 제거 */}
          <image
            href={currentBg}
            x="0" y="0"
            width={VB_W} height={VB_H}
            preserveAspectRatio="xMidYMid slice"
          />

          {/* 핫스팟 - SVG 좌표 공간에서 직접 배치 */}
          {visibleHotspots.map(hotspot => {
            const isActive = isVisible(hotspot.activeWhen);
            const [xPct, yPct, wPct, hPct] = hotspot.area;
            const x = (xPct / 100) * VB_W;
            const y = (yPct / 100) * VB_H;
            const w = (wPct / 100) * VB_W;
            const h = (hPct / 100) * VB_H;
            const isHovered = hoveredId === hotspot.id;

            return (
              <g
                key={hotspot.id}
                className={`room__hotspot-g ${isActive ? 'room__hotspot-g--active' : ''}`}
                onMouseEnter={() => setHoveredId(hotspot.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (!isActive) {
                    if (hotspot.failMessage) onShowMessage(hotspot.failMessage);
                    return;
                  }
                  onHotspotClick(hotspot.action);
                }}
                style={{ cursor: isActive ? 'pointer' : 'not-allowed' }}
              >
                {/* 클릭 영역 - 모바일: 반투명 표시 / 데스크톱: 호버 시만 */}
                <rect
                  x={x} y={y} width={w} height={h}
                  rx="6"
                  className={`room__hotspot-rect ${isActive ? 'room__hotspot-rect--active' : ''} ${isHovered ? 'room__hotspot-rect--hover' : ''}`}
                />

                {/* 반짝이 힌트 */}
                {isActive && !isHovered && (
                  <text
                    x={x + w - 8}
                    y={y + 16}
                    fontSize="14"
                    fill="#ffd700"
                    style={{ pointerEvents: 'none' }}
                    className="room__sparkle"
                  >
                    ✦
                  </text>
                )}

                {/* 호버 라벨 */}
                {isHovered && isActive && hotspot.label && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect
                      x={x + w / 2 - hotspot.label.length * 7}
                      y={y - 30}
                      width={hotspot.label.length * 14 + 16}
                      height="24"
                      rx="12"
                      fill="rgba(30,25,20,0.9)"
                      stroke="rgba(212,168,71,0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x={x + w / 2}
                      y={y - 14}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#f0e6d3"
                      fontFamily="'Noto Serif KR', serif"
                    >
                      {hotspot.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* 방향 화살표 (HTML - 뷰포트 기준) */}
        {room.nav?.left && (
          <button className="room__nav room__nav--left" onClick={() => onNavigate(room.nav!.left!)} title="왼쪽 보기">
            <span className="room__nav-icon">‹</span>
          </button>
        )}
        {room.nav?.right && (
          <button className="room__nav room__nav--right" onClick={() => onNavigate(room.nav!.right!)} title="오른쪽 보기">
            <span className="room__nav-icon">›</span>
          </button>
        )}
        {room.nav?.back && (
          <button className="room__nav room__nav--back" onClick={() => onNavigate(room.nav!.back!)} title="뒤돌아보기">
            <span className="room__nav-icon">↺</span>
          </button>
        )}
      </div>
    </div>
  );
}
