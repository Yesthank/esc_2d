import { useState } from 'react';
import type { Dialog } from '../types';
import './DialogModal.css';

interface Props {
  dialog: Dialog;
  onComplete: (dialog: Dialog) => void;
}

export function DialogModal({ dialog, onComplete }: Props) {
  const [lineIndex, setLineIndex] = useState(0);
  const line = dialog.lines[lineIndex];
  const isLast = lineIndex >= dialog.lines.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete(dialog);
    } else {
      setLineIndex(prev => prev + 1);
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleNext}>
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        {line.speaker && (
          <div className="dialog-box__speaker">{line.speaker}</div>
        )}
        <p className="dialog-box__text">{line.text}</p>
        <button className="dialog-box__next" onClick={handleNext}>
          {isLast ? '...' : '▼'}
        </button>
        <div className="dialog-box__progress">
          {dialog.lines.map((_, i) => (
            <span
              key={i}
              className={`dialog-box__dot ${i <= lineIndex ? 'dialog-box__dot--active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
