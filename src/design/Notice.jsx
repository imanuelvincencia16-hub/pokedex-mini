export default function Notice({ mark, title, text, action, onAction }) {
  return (
    <div className="notice">
      <span className="notice__mark">{mark}</span>
      <h3 className="notice__title">{title}</h3>
      {text && <p className="notice__text">{text}</p>}
      {action && (
        <button type="button" className="action" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
