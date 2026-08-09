export default function StatusPill({ status, label }) {
  return (
    <span className={`status ${status}`}>
      <span className="ring" />
      {label || status}
    </span>
  );
}
