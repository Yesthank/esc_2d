import { useState } from 'react';
import type { Puzzle } from '../types';
import './PuzzleModal.css';

interface Props {
  puzzle: Puzzle;
  onSolve: (puzzleId: string) => void;
  onClose: () => void;
}

export function PuzzleModal({ puzzle, onSolve, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal puzzle-modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        <h3 className="puzzle-modal__title">{puzzle.title ?? '퍼즐'}</h3>
        {puzzle.type === 'keypad' && (
          <KeypadUI puzzle={puzzle} onSolve={() => onSolve(puzzle.id)} />
        )}
        {puzzle.type === 'text-input' && (
          <TextInputUI puzzle={puzzle} onSolve={() => onSolve(puzzle.id)} />
        )}
        {puzzle.type === 'sequence' && (
          <SequenceUI puzzle={puzzle} onSolve={() => onSolve(puzzle.id)} />
        )}
      </div>
    </div>
  );
}

/** 키패드 (숫자 입력) */
function KeypadUI({ puzzle, onSolve }: { puzzle: Extract<Puzzle, { type: 'keypad' }>; onSolve: () => void }) {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (input.length >= puzzle.digits) return;
    const next = input + d;
    setInput(next);
    if (next.length === puzzle.digits) {
      if (next === puzzle.answer) {
        setTimeout(onSolve, 300);
      } else {
        setShake(true);
        setTimeout(() => { setShake(false); setInput(''); }, 600);
      }
    }
  };

  return (
    <div className="keypad">
      <div className={`keypad__display ${shake ? 'keypad__display--shake' : ''}`}>
        {Array.from({ length: puzzle.digits }, (_, i) => (
          <span key={i} className="keypad__digit">
            {input[i] ?? '·'}
          </span>
        ))}
      </div>
      <div className="keypad__buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((btn, i) => (
          <button
            key={i}
            className={`keypad__btn ${btn === null ? 'keypad__btn--empty' : ''}`}
            onClick={() => {
              if (btn === 'del') setInput(prev => prev.slice(0, -1));
              else if (btn !== null) handleDigit(String(btn));
            }}
            disabled={btn === null}
          >
            {btn === 'del' ? '⌫' : btn ?? ''}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 텍스트 입력형 (SELF_QUIZ_BANK 문제용) */
function TextInputUI({ puzzle, onSolve }: { puzzle: Extract<Puzzle, { type: 'text-input' }>; onSolve: () => void }) {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const isFlipped = puzzle.id === 'quiz3-flipped';

  const handleSubmit = () => {
    const normalized = input.trim().toLowerCase();
    const answer = puzzle.answer.toLowerCase();
    if (normalized === answer) {
      onSolve();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="text-input-puzzle">
      {puzzle.image && <img src={puzzle.image} alt="" className="text-input-puzzle__image" />}
      <div className={`text-input-puzzle__prompt ${isFlipped ? 'text-input-puzzle__prompt--flipped' : ''}`} dangerouslySetInnerHTML={{ __html: puzzle.prompt }} />
      <div className={`text-input-puzzle__field ${shake ? 'text-input-puzzle__field--shake' : ''}`}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={puzzle.placeholder ?? '정답 입력...'}
          autoFocus
        />
        <button onClick={handleSubmit} className="text-input-puzzle__submit">확인</button>
      </div>
    </div>
  );
}

/** 순서 맞추기 */
function SequenceUI({ puzzle, onSolve }: { puzzle: Extract<Puzzle, { type: 'sequence' }>; onSolve: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
      return;
    }
    const next = [...selected, id];
    setSelected(next);
    if (next.length === puzzle.answer.length) {
      if (next.every((s, i) => s === puzzle.answer[i])) {
        setTimeout(onSolve, 300);
      } else {
        setShake(true);
        setTimeout(() => { setShake(false); setSelected([]); }, 600);
      }
    }
  };

  return (
    <div className={`sequence-puzzle ${shake ? 'sequence-puzzle--shake' : ''}`}>
      <div className="sequence-puzzle__selected">
        {selected.map((id, i) => {
          const opt = puzzle.options.find(o => o.id === id);
          return <span key={i} className="sequence-puzzle__tag">{opt?.label}</span>;
        })}
        {selected.length === 0 && <span className="sequence-puzzle__hint">순서대로 선택하세요</span>}
      </div>
      <div className="sequence-puzzle__options">
        {puzzle.options.map(opt => (
          <button
            key={opt.id}
            className={`sequence-puzzle__option ${selected.includes(opt.id) ? 'sequence-puzzle__option--used' : ''}`}
            onClick={() => handleSelect(opt.id)}
            disabled={selected.includes(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
