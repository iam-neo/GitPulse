import { T, fontMono, cardStyle } from '../../constants/tokens';

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export default function CompareCard({ profile, totalStars, accent, colorOverride }) {
  const cardAccentColor = colorOverride || accent;

  return (
    <div style={cardStyle}>
      {/* Glowing radial backdrop */}
      <div style={{
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${cardAccentColor}33 0%, transparent 70%)`,
        top: -20,
        left: -20,
        zIndex: 0,
        animation: 'breathingGlow 4s infinite ease-in-out',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', zIndex: 1, position: 'relative' }}>
        <img src={profile.avatar_url} style={{ width: 64, height: 64, borderRadius: '50%', border: `2px solid ${cardAccentColor}` }} alt={profile.login} />
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary }}>{profile.name || profile.login}</h2>
          <div style={{ fontSize: 12, fontFamily: fontMono, color: cardAccentColor }}>@{profile.login}</div>
          {profile.bio && <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 4 }}>{truncate(profile.bio, 80)}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
        {[
          { label: 'Repos', val: profile.public_repos },
          { label: 'Followers', val: profile.followers },
          { label: 'Stars', val: totalStars },
        ].map(item => (
          <div key={item.label} style={{ flex: 1, background: T.bgSunken, border: `1px solid ${T.border}`, padding: 10, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: cardAccentColor, fontFamily: fontMono }}>{item.val}</div>
            <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
