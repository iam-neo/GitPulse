import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { T, fontMono, sectionTitle, cardStyle } from '../../constants/tokens';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import CompareCard from './CompareCard';
import { Skeleton } from '../UI/Skeleton';

export default function CompareMode({
  accent,
  queryA, setQueryA,
  queryB, setQueryB,
  profileA,
  profileB,
  reposA,
  reposB,
  loadingA,
  loadingB,
  errorA,
  errorB,
  totalStarsA,
  totalStarsB,
  searchCompareUser
}) {
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const userBColor = accent === '#9061FF' ? '#EC4899' : '#9061FF';

  // VS Comparison Bar Graph Data
  const compareChartData = (profileA && profileB) ? [
    { name: 'Public Repos', [profileA.login]: profileA.public_repos, [profileB.login]: profileB.public_repos },
    { name: 'Followers', [profileA.login]: profileA.followers, [profileB.login]: profileB.followers },
    { name: 'Total Stars', [profileA.login]: totalStarsA, [profileB.login]: totalStarsB },
  ] : [];

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      
      {/* Compare Search Header Bar */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        padding: 20,
        background: 'rgba(22, 27, 34, 0.5)',
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        width: '100%',
      }}>
        {/* User A Input */}
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <input
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchCompareUser('A', queryA)}
            placeholder="Username A..."
            style={{
              background: T.bgSunken,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '8px 14px',
              color: T.textPrimary,
              fontFamily: fontMono,
              fontSize: 13,
              flex: isMobile ? 1 : 'none',
              width: isMobile ? 'auto' : 180,
            }}
          />
          <button
            onClick={() => searchCompareUser('A', queryA)}
            style={{
              background: accent,
              color: T.bgBase,
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontFamily: fontMono,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            LOAD
          </button>
        </div>

        <div style={{ fontFamily: fontMono, fontWeight: 700, fontSize: 16, color: T.textMuted }}>VS</div>

        {/* User B Input */}
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <input
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchCompareUser('B', queryB)}
            placeholder="Username B..."
            style={{
              background: T.bgSunken,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '8px 14px',
              color: T.textPrimary,
              fontFamily: fontMono,
              fontSize: 13,
              flex: isMobile ? 1 : 'none',
              width: isMobile ? 'auto' : 180,
            }}
          />
          <button
            onClick={() => searchCompareUser('B', queryB)}
            style={{
              background: userBColor,
              color: T.bgBase,
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontFamily: fontMono,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            LOAD
          </button>
        </div>
      </div>

      {/* Error notifications for A or B */}
      {(errorA || errorB) && (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, marginBottom: 20 }}>
          {errorA && <div style={{ flex: 1, color: '#EF4444', fontSize: 12, fontFamily: fontMono }}>⚠ Left: {errorA}</div>}
          {errorB && <div style={{ flex: 1, color: '#EF4444', fontSize: 12, fontFamily: fontMono }}>⚠ Right: {errorB}</div>}
        </div>
      )}

      {/* Compare Content Landing State */}
      {(!profileA && !profileB && !loadingA && !loadingB) && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: T.textSecondary }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>⚔️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>VS Profile Duel</h2>
          <p style={{ fontSize: 14, maxWidth: 450, margin: '0 auto', lineHeight: 1.6 }}>
            Enter usernames above to perform side-by-side comparative analysis of stars, followers, and repositories.
          </p>
        </div>
      )}

      {/* Duel Cards grid */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
        
        {/* Column A (Left) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loadingA && (
            <div style={cardStyle}>
              <Skeleton width={88} height={88} borderRadius="50%" style={{ marginBottom: 16 }} />
              <Skeleton width={180} height={20} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={80} />
            </div>
          )}
          {profileA && !loadingA && (
            <CompareCard
              profile={profileA}
              totalStars={totalStarsA}
              accent={accent}
            />
          )}
        </div>

        {/* Column B (Right) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loadingB && (
            <div style={cardStyle}>
              <Skeleton width={88} height={88} borderRadius="50%" style={{ marginBottom: 16 }} />
              <Skeleton width={180} height={20} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={80} />
            </div>
          )}
          {profileB && !loadingB && (
            <CompareCard
              profile={profileB}
              totalStars={totalStarsB}
              accent={accent}
              colorOverride={userBColor}
            />
          )}
        </div>
      </div>

      {/* Verdict & Comparative Charts */}
      {profileA && profileB && !loadingA && !loadingB && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
          
          {/* Winner Verdict Banner */}
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            background: 'linear-gradient(90deg, rgba(22, 27, 34, 0.8) 0%, rgba(33, 38, 45, 0.4) 50%, rgba(22, 27, 34, 0.8) 100%)',
          }}>
            <h3 style={{ fontSize: 13, fontFamily: fontMono, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Verdict Overview
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              gap: isMobile ? 8 : 24,
              fontSize: 14
            }}>
              <div>
                ⭐ Stars Winner:{' '}
                <span style={{ fontWeight: 700, color: totalStarsA >= totalStarsB ? accent : userBColor }}>
                  {totalStarsA >= totalStarsB ? profileA.login : profileB.login} 👑
                </span>
              </div>
              <div>
                👥 Followers Winner:{' '}
                <span style={{ fontWeight: 700, color: profileA.followers >= profileB.followers ? accent : userBColor }}>
                  {profileA.followers >= profileB.followers ? profileA.login : profileB.login} 👑
                </span>
              </div>
              <div>
                📦 Repo Count Winner:{' '}
                <span style={{ fontWeight: 700, color: profileA.public_repos >= profileB.public_repos ? accent : userBColor }}>
                  {profileA.public_repos >= profileB.public_repos ? profileA.login : profileB.login} 👑
                </span>
              </div>
            </div>
          </div>

          {/* Comparative Recharts Graphic */}
          <div style={cardStyle}>
            <div style={sectionTitle}>
              <span style={{ fontSize: 16 }}>📊</span>
              Metric Breakdown Comparison
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={compareChartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: T.textMuted, fontFamily: fontMono, fontSize: 11 }} />
                <YAxis tick={{ fill: T.textMuted, fontFamily: fontMono, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: T.bgSurface, borderColor: T.border }} labelStyle={{ color: accent }} />
                <Legend />
                <Bar dataKey={profileA.login} fill={accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey={profileB.login} fill={userBColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
