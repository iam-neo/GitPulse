import { T, fontMono } from '../../constants/tokens';

export default function StatPill({ label, value, accent }) {
  return (
    <div
      style={{
        background: T.bgSunken,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: '10px 16px',
        textAlign: 'center',
        minWidth: 100,
        flex: '1 1 100px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        fontFamily: fontMono,
        fontSize: 22,
        fontWeight: 700,
        color: accent,
        lineHeight: 1.2,
      }}>
        {value?.toLocaleString() ?? 0}
      </div>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: T.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}
