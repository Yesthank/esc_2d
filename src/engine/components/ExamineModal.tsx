import './PuzzleModal.css';

interface Props {
  text: string;
  image?: string;
  onClose: () => void;
}

export function ExamineModal({ text, image, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        {image && <img src={image} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />}
        <p style={{ fontFamily: "'Noto Serif KR', serif", color: '#2a1d14', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{text}</p>
      </div>
    </div>
  );
}
