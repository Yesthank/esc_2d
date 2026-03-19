import { useEffect, useRef } from 'react';
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

export function Room({ room, state, onHotspotClick, onShowMessage, onNavigate, onDialog, selectedItem }: Props) {
  const shownEntryRef = useRef<Set<string>>(new Set());

  const isVisible = (condition?: Condition) => {
    if (!condition) return true;
    return checkCondition(condition, state);
  };

  // 현재 조건에 맞는 배경 선택 (base URL 자동 적용)
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

  return (
    <div className="room">
      <div className="room__viewport">
        <img
          key={currentBg}
          src={currentBg}
          alt={room.name}
          className="room__bg"
          draggable={false}
        />

        {/* 핫스팟 */}
        {room.hotspots
          .filter(hs => isVisible(hs.visibleWhen))
          .map(hotspot => {
            const isActive = isVisible(hotspot.activeWhen);
            return (
              <button
                key={hotspot.id}
                className={`room__hotspot ${isActive ? 'room__hotspot--active' : 'room__hotspot--inactive'} ${selectedItem ? 'room__hotspot--using-item' : ''}`}
                style={{
                  left: `${hotspot.area[0]}%`,
                  top: `${hotspot.area[1]}%`,
                  width: `${hotspot.area[2]}%`,
                  height: `${hotspot.area[3]}%`,
                }}
                onClick={() => {
                  if (!isActive) {
                    if (hotspot.failMessage) onShowMessage(hotspot.failMessage);
                    return;
                  }
                  onHotspotClick(hotspot.action);
                }}
                title={hotspot.label}
              >
                {hotspot.label && <span className="room__hotspot-label">{hotspot.label}</span>}
              </button>
            );
          })}

        {/* 방향 탐색 화살표 */}
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
