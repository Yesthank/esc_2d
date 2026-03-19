import './GameClearModal.css';

interface Props {
  title: string;
  message?: string;
  elapsed: number;
  hintsUsed: number;
  onRestart: () => void;
  onLobby: () => void;
}

export function GameClearModal({ title, message, elapsed, hintsUsed, onRestart, onLobby }: Props) {
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;

  return (
    <div className="modal-overlay">
      <div className="modal game-clear">
        <div className="game-clear__icon">🎉</div>
        <h2 className="game-clear__title">탈출 성공!</h2>
        <p className="game-clear__subtitle">{title}</p>
        {message && <p className="game-clear__message">{message}</p>}
        <div className="game-clear__stats">
          <div className="game-clear__stat">
            <span className="game-clear__stat-label">소요 시간</span>
            <span className="game-clear__stat-value">{min}분 {sec}초</span>
          </div>
          <div className="game-clear__stat">
            <span className="game-clear__stat-label">힌트 사용</span>
            <span className="game-clear__stat-value">{hintsUsed}회</span>
          </div>
        </div>
        <div className="game-clear__actions">
          <button className="game-clear__btn game-clear__btn--retry" onClick={onRestart}>다시 도전</button>
          <button className="game-clear__btn game-clear__btn--lobby" onClick={onLobby}>로비로</button>
        </div>
      </div>
    </div>
  );
}
