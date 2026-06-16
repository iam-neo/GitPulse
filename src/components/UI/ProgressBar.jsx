export default function ProgressBar({ loading, accent }) {
  if (!loading) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: 2,
      background: accent,
      zIndex: 9999,
      animation: 'progress 1.5s ease-out forwards',
      boxShadow: `0 0 8px ${accent}`,
      pointerEvents: 'none',
    }} />
  );
}
