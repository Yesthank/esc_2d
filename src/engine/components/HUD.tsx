import './HUD.css';

interface Props {
  roomName: string;
  timer?: string;
  onHint?: () => void;
}

export function HUD({ roomName, timer, onHint }: Props) {
  return (
    <div className="hud">
      <div className="hud__left">
        <span className="hud__room-name">{roomName}</span>
      </div>
      <div className="hud__right">
        {timer && <span className="hud__timer">{timer}</span>}
        {onHint && (
          <button className="hud__hint-btn" onClick={onHint} title="힌트">
            💡
          </button>
        )}
      </div>
    </div>
  );
}
