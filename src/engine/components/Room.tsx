import { useEffect, useRef, useState, useCallback } from 'react';
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgRect, setImgRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

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

  // 이미지 실제 렌더 영역 계산 (object-fit: contain 고려)
  const updateImgRect = useCallback(() => {
    const img = imgRef.current;
    const viewport = viewportRef.current;
    if (!img || !viewport) return;

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const naturalW = img.naturalWidth || 1280;
    const naturalH = img.naturalHeight || 720;
    const scale = Math.min(vw / naturalW, vh / naturalH);
    const renderedW = naturalW * scale;
    const renderedH = naturalH * scale;
    const offsetX = (vw - renderedW) / 2;
    const offsetY = (vh - renderedH) / 2;

    setImgRect({ left: offsetX, top: offsetY, width: renderedW, height: renderedH });
  }, []);

  useEffect(() => {
    updateImgRect();
    window.addEventListener('resize', updateImgRect);
    return () => window.removeEventListener('resize', updateImgRect);
  }, [updateImgRect, currentBg]);

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
      <div className="room__viewport" ref={viewportRef}>
        <img
          key={currentBg}
          ref={imgRef}
          src={currentBg}
          alt={room.name}
          className="room__bg"
          draggable={false}
          onLoad={updateImgRect}
        />

        {/* 핫스팟 - 이미지 실제 렌더 영역에 맞춰 배치 */}
        {imgRect && room.hotspots
          .filter(hs => isVisible(hs.visibleWhen))
          .map(hotspot => {
            const isActive = isVisible(hotspot.activeWhen);
            return (
              <button
                key={hotspot.id}
                className={`room__hotspot ${isActive ? 'room__hotspot--active' : 'room__hotspot--inactive'} ${selectedItem ? 'room__hotspot--using-item' : ''}`}
                style={{
                  left: imgRect.left + (hotspot.area[0] / 100) * imgRect.width,
                  top: imgRect.top + (hotspot.area[1] / 100) * imgRect.height,
                  width: (hotspot.area[2] / 100) * imgRect.width,
                  height: (hotspot.area[3] / 100) * imgRect.height,
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
