import './MessageBox.css';

interface Props {
  text: string;
  onDismiss: () => void;
}

export function MessageBox({ text, onDismiss }: Props) {
  return (
    <div className="message-box-overlay" onClick={onDismiss}>
      <div className="message-box" onClick={e => e.stopPropagation()}>
        <p className="message-box__text">{text}</p>
        <button className="message-box__btn" onClick={onDismiss}>확인</button>
      </div>
    </div>
  );
}
