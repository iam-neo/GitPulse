import { T, fontMono, THEME_ACCENTS } from '../../constants/tokens';

export default function SettingsDropdown({
  accent,
  onAccentChange,
  pat,
  onPatChange,
  onSave,
  onClear,
  rateLimit,
  isMobile
}) {
  const containerStyle = isMobile ? {
    width: '100%',
    background: 'rgba(22, 27, 34, 0.4)',
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: 16,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  } : {
    position: 'absolute',
    top: '48px',
    right: 0,
    width: 320,
    background: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    zIndex: 100,
    animation: 'fadeIn .2s ease',
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ fontSize: 14, color: T.textPrimary, marginBottom: 8, fontFamily: fontMono }}>
        GitHub Settings
      </h3>
      
      {/* Theme customizer */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, color: T.textMuted, marginBottom: 8, fontFamily: fontMono }}>
          Theme Accent Color
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {THEME_ACCENTS.map(item => (
            <div
              key={item.name}
              onClick={() => onAccentChange(item.value)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: item.value,
                cursor: 'pointer',
                border: accent === item.value ? '2px solid #FFF' : `1px solid ${T.border}`,
                transform: accent === item.value ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}
              title={item.name}
            />
          ))}
        </div>
      </div>

      <p style={{ fontSize: 11, color: T.textSecondary, marginBottom: 12, lineHeight: 1.4 }}>
        Provide a Personal Access Token (PAT) to increase public rate limits to 5,000 reqs/hr.
      </p>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, color: T.textMuted, marginBottom: 4, fontFamily: fontMono }}>
          Personal Access Token (PAT)
        </label>
        <input
          type="password"
          value={pat}
          onChange={(e) => onPatChange(e.target.value)}
          placeholder="ghp_..."
          style={{
            width: '100%',
            background: T.bgSunken,
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            padding: '8px 10px',
            color: T.textPrimary,
            fontFamily: fontMono,
            fontSize: 12,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={onSave}
          style={{
            flex: 1,
            background: accent,
            color: T.bgBase,
            border: 'none',
            borderRadius: 6,
            padding: '8px 12px',
            fontFamily: fontMono,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          SAVE
        </button>
        <button
          onClick={onClear}
          style={{
            background: 'transparent',
            border: `1px solid ${T.border}`,
            color: T.textSecondary,
            borderRadius: 6,
            padding: '8px 12px',
            fontFamily: fontMono,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          CLEAR
        </button>
      </div>

      {rateLimit && (
        <div style={{
          borderTop: `1px solid ${T.border}`,
          paddingTop: 8,
          fontSize: 11,
          fontFamily: fontMono,
          color: T.textMuted,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>
          <div>Limit: {rateLimit.limit} requests/hr</div>
          <div>Remaining: {rateLimit.remaining}</div>
          {rateLimit.reset && <div>Resets at: {rateLimit.reset}</div>}
        </div>
      )}
    </div>
  );
}
