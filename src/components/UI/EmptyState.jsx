import { T, fontMono } from '../../constants/tokens';

export default function EmptyState({ history, onHistoryClick, accent }) {
  return (
    <div style={{
      textAlign: 'center',
      marginTop: 100,
      animation: 'fadeIn .5s ease',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>⌨️</div>
      <h1 style={{
        fontSize: 28,
        fontWeight: 700,
        color: T.textPrimary,
        marginBottom: 8,
      }}>
        Track any GitHub profile
      </h1>
      <p style={{
        fontSize: 16,
        color: T.textSecondary,
        maxWidth: 420,
        margin: '0 auto 32px',
        lineHeight: 1.6,
      }}>
        Enter a username above to visualize activity, repos, and language stats.
      </p>

      {/* History Bookmarks in Empty State */}
      {history && history.length > 0 && (
        <div style={{ maxWidth: 500, margin: '0 auto', animation: 'fadeIn .4s ease' }}>
          <h3 style={{
            fontSize: 11,
            fontWeight: 600,
            color: T.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
            fontFamily: fontMono,
          }}>
            Recent Pulses
          </h3>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {history.map((item) => (
              <div
                key={item.login}
                onClick={() => onHistoryClick(item.login)}
                style={{
                  background: T.bgSurface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 24,
                  padding: '6px 14px 6px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                  userSelect: 'none',
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
                <img
                  src={item.avatarUrl}
                  alt={item.login}
                  style={{ width: 24, height: 24, borderRadius: '50%' }}
                />
                <span style={{
                  fontSize: 12,
                  fontFamily: fontMono,
                  color: T.textPrimary,
                  fontWeight: 600,
                }}>
                  {item.login}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
