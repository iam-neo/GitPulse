import { T, fontMono, fontBody } from '../../constants/tokens';

function formatJoinedDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Joined ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ShareCard({ profile, repos, events, totalStars, accent, cardRef }) {
  if (!profile) return null;

  // Calculate top languages
  const langMap = {};
  repos.forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  });
  const topLanguages = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => {
      const percentage = repos.length ? ((count / repos.length) * 100).toFixed(0) : 0;
      return { name, percentage };
    });

  return (
    <div
      ref={cardRef}
      style={{
        width: 1200,
        height: 630,
        background: T.bgBase,
        color: T.textPrimary,
        fontFamily: fontBody,
        padding: '60px 80px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        border: `4px solid ${T.border}`,
        borderRadius: 24,
        backgroundImage: `radial-gradient(circle at 10% 20%, ${accent}15 0%, transparent 40%), radial-gradient(circle at 90% 80%, ${accent}0d 0%, transparent 45%)`,
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Accent Ring */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        border: `1px solid ${accent}08`,
        top: -250,
        left: -100,
        pointerEvents: 'none'
      }} />

      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>⚡</span>
          <span style={{ fontFamily: fontMono, fontSize: 32, fontWeight: 700, color: accent }}>
            {'<git·pulse />'}
          </span>
        </div>
        <div style={{ fontFamily: fontMono, fontSize: 18, color: T.textMuted }}>
          gitpulse.app/octocat
        </div>
      </div>

      {/* Main Body */}
      <div style={{ display: 'flex', gap: 60, alignItems: 'center', flex: 1, margin: '40px 0' }}>
        {/* Left column: User identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <img
              src={profile.avatar_url}
              alt={profile.login}
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: `4px solid ${accent}`,
                boxShadow: `0 0 20px ${accent}26`
              }}
            />
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{profile.name || profile.login}</h2>
              <div style={{ fontSize: 20, fontFamily: fontMono, color: accent }}>@{profile.login}</div>
              <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4 }}>
                {formatJoinedDate(profile.created_at)}
              </div>
            </div>
          </div>
          {profile.bio ? (
            <p style={{ fontSize: 16, color: T.textSecondary, lineHeight: 1.5, margin: '8px 0 0' }}>
              {profile.bio.length > 150 ? profile.bio.slice(0, 150) + '…' : profile.bio}
            </p>
          ) : (
            <p style={{ fontSize: 16, color: T.textMuted, fontStyle: 'italic', margin: '8px 0 0' }}>
              No bio written.
            </p>
          )}
        </div>

        {/* Right column: Stats grid and languages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { label: 'PUBLIC REPOS', value: profile.public_repos },
              { label: 'FOLLOWERS', value: profile.followers },
              { label: 'TOTAL STARS', value: totalStars },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background: T.bgSurface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: '20px 24px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontFamily: fontMono, fontSize: 36, fontWeight: 800, color: accent }}>
                  {stat.value?.toLocaleString() ?? 0}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, letterSpacing: '0.08em', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Languages Section */}
          {topLanguages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Top Languages
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {topLanguages.map((lang, idx) => (
                  <div
                    key={lang.name}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${T.border}`,
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{lang.name}</span>
                    <span style={{ fontFamily: fontMono, fontSize: 16, fontWeight: 700, color: accent }}>
                      {lang.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding Strip */}
      <div style={{ display: 'flex', justifySelf: 'flex-end', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${T.border}`, paddingTop: 20, width: '100%' }}>
        <div style={{ fontSize: 14, color: T.textMuted }}>
          Generated by GitPulse activity dashboard v2.1
        </div>
        <div style={{ fontSize: 14, color: accent, fontWeight: 600 }}>
          gitpulse.iam-neo.dev
        </div>
      </div>
    </div>
  );
}
