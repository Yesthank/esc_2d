import { useState } from 'react';
import { GameRunner } from './engine/GameRunner';
import type { GameConfig } from './engine/types';
import game1Config from './games/game1-mysterious-room/config';
import './App.css';

const games: GameConfig[] = [game1Config];

function App() {
  const [activeGame, setActiveGame] = useState<GameConfig | null>(null);

  if (activeGame) {
    return <GameRunner config={activeGame} onExit={() => setActiveGame(null)} />;
  }

  return (
    <div className="lobby">
      <div className="lobby__header">
        <h1 className="lobby__title">ESCAPE</h1>
        <p className="lobby__subtitle">방탈출 퍼즐 게임</p>
      </div>

      <div className="lobby__games">
        {games.map(game => (
          <button
            key={game.id}
            className="lobby__card"
            onClick={() => setActiveGame(game)}
          >
            <div className="lobby__card-thumb">
              <div className="lobby__card-placeholder">🔐</div>
            </div>
            <div className="lobby__card-info">
              <h2 className="lobby__card-title">{game.title}</h2>
              <p className="lobby__card-desc">{game.description}</p>
              <div className="lobby__card-meta">
                <span>🕐 {Math.floor(game.timeLimit / 60)}분</span>
                <span>🚪 {game.rooms.length}개의 방</span>
                <span>🧩 {game.puzzles.length}개의 퍼즐</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <footer className="lobby__footer">
        <p>Escape Puzzle Engine</p>
      </footer>
    </div>
  );
}

export default App;
