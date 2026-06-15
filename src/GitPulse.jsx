import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ─── Design Tokens ─── */
const T = {
  bgBase:       '#0D1117',
  bgSurface:    '#161B22',
  bgSunken:     '#0D1117',
  border:       '#21262D',
  borderHover:  '#30363D',
  accent:       '#00D4FF',
  textPrimary:  '#F0F6FC',
  textSecondary:'#8B949E',
  textMuted:    '#6E7681',
  greenDark:    '#0E4429',
  greenMid:     '#006D32',
  greenBright:  '#26A641',
  greenVivid:   '#39D353',
};

const CHART_COLORS = ['#00D4FF','#7C3AED','#10B981','#F59E0B','#EF4444','#EC4899','#3B82F6','#14B8A6'];

const fontBody = "'Segoe UI', system-ui, sans-serif";
const fontMono = "monospace";

/* ─── Global Styles (injected once) ─── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bgBase}; font-family: ${fontBody}; color: ${T.textPrimary}; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bgBase}; }
  ::-webkit-scrollbar-thumb { background: ${T.borderHover}; border-radius: 3px; }
  input:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px rgba(0,212,255,0.15) !important; outline: none; }
  button:hover { opacity: 0.85; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .6; } }
`;

/* ─── Helpers ─── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function eventDescription(ev) {
  const repo = ev.repo?.name?.split('/')[1] || ev.repo?.name || '';
  switch (ev.type) {
    case 'PushEvent': {
      const n = ev.payload?.commits?.length || 0;
      return `Pushed ${n} commit${n !== 1 ? 's' : ''} to ${repo}`;
    }
    case 'PullRequestEvent':
      return `${ev.payload?.action || 'Opened'} PR in ${repo}`;
    case 'IssuesEvent':
      return `${ev.payload?.action || 'Opened'} issue in ${repo}`;
    case 'WatchEvent':
      return `Starred ${repo}`;
    case 'ForkEvent':
      return `Forked ${repo}`;
    case 'CreateEvent':
      return `Created ${ev.payload?.ref_type || 'ref'} in ${repo}`;
    default:
      return `${ev.type?.replace('Event', '') || 'Activity'} on ${repo}`;
  }
}

function buildHeatmap(events) {
  const counts = {};
  if (Array.isArray(events)) {
    events.forEach(ev => {
      const d = ev.created_at?.slice(0, 10);
      if (d) counts[d] = (counts[d] || 0) + 1;
    });
  }

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 182);
  // Align to nearest previous Sunday
  while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

  const weeks = [];
  let week = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    week.push({ date: key, count: counts[key] || 0 });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (week.length) weeks.push(week);
  return weeks;
}

function heatColor(count) {
  if (count === 0)  return T.bgSurface;
  if (count <= 2)   return T.greenDark;
  if (count <= 5)   return T.greenMid;
  if (count <= 9)   return T.greenBright;
  return T.greenVivid;
}

/* ─── Shared Style Objects ─── */
const cardStyle = {
  background: T.bgSurface,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: 24,
  animation: 'fadeIn .4s ease',
};

const sectionTitle = {
  fontSize: 15,
  fontWeight: 600,
  color: T.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

/* ─── Custom Tooltip for Bar Chart ─── */
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.bgSurface,
      border: `1px solid ${T.borderHover}`,
      borderRadius: 6,
      padding: '8px 12px',
      fontFamily: fontMono,
      fontSize: 12,
      color: T.textPrimary,
    }}>
      <div style={{ color: T.accent, marginBottom: 2 }}>{label}</div>
      <div>⭐ {payload[0].value} stars</div>
    </div>
  );
}

/* ─── Custom Label for Pie Chart ─── */
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill={T.textPrimary} textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontFamily: fontMono, fontWeight: 600 }}>
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/* ═══════════════════════════════════════════════════
   GitPulse — Main Component
   ═══════════════════════════════════════════════════ */
export default function GitPulse() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalStars, setTotalStars] = useState(0);

  const search = useCallback(async () => {
    const username = query.trim();
    if (!username) return;
    setLoading(true);
    setError('');
    setProfile(null);
    setRepos([]);
    setEvents([]);
    setTotalStars(0);

    try {
      const [profileRes, reposRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
        fetch(`https://api.github.com/users/${username}/events/public?per_page=100`),
      ]);

      if (profileRes.status === 404) {
        setError(`User "${username}" not found.`);
        return;
      }
      if (!profileRes.ok) {
        setError('GitHub API error. Try again.');
        return;
      }

      const profileData = await profileRes.json();
      const reposData = await reposRes.json();
      const eventsData = await eventsRes.json();

      const safeRepos = Array.isArray(reposData) ? reposData : [];
      const safeEvents = Array.isArray(eventsData) ? eventsData : [];

      setProfile(profileData);
      setRepos(safeRepos);
      setEvents(safeEvents);
      setTotalStars(safeRepos.reduce((s, r) => s + (r.stargazers_count || 0), 0));
    } catch {
      setError('GitHub API error. Try again.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKey = (e) => { if (e.key === 'Enter') search(); };

  /* ─── Derived Data ─── */
  const starData = repos
    .filter(r => r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map(r => ({ name: truncate(r.name, 15), stars: r.stargazers_count }));

  const langMap = {};
  repos.slice(0, 10).forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  });
  const langData = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const topRepos = [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 5);
  const recentEvents = events.slice(0, 8);
  const heatmapWeeks = buildHeatmap(events);

  const heatLegendColors = [T.bgSurface, T.greenDark, T.greenMid, T.greenBright, T.greenVivid];

  /* ═══ RENDER ═══ */
  return (
    <div style={{ minHeight: '100vh', background: T.bgBase, fontFamily: fontBody }}>
      <style>{GLOBAL_CSS}</style>

      {/* ─── Header ─── */}
      <header style={{
        background: `linear-gradient(180deg, ${T.bgSurface} 0%, ${T.bgBase} 100%)`,
        borderBottom: `1px solid ${T.border}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          fontFamily: fontMono,
          fontWeight: 700,
          fontSize: 22,
          color: T.accent,
          letterSpacing: '-0.02em',
          userSelect: 'none',
        }}>
          {'<gh·track />'}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Enter GitHub username..."
            style={{
              background: T.bgSunken,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '10px 16px',
              color: T.textPrimary,
              fontFamily: fontBody,
              fontSize: 14,
              width: 280,
              transition: 'border-color .2s, box-shadow .2s',
            }}
          />
          <button
            id="search-button"
            onClick={search}
            style={{
              background: T.accent,
              color: T.bgBase,
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontFamily: fontMono,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'opacity .2s',
            }}
          >
            SEARCH
          </button>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Empty State */}
        {!loading && !error && !profile && (
          <div style={{
            textAlign: 'center',
            marginTop: 120,
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
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              Enter a username above to visualize activity, repos, and language stats.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            marginTop: 120,
            animation: 'fadeIn .3s ease',
          }}>
            <div style={{
              width: 48,
              height: 48,
              border: `3px solid ${T.border}`,
              borderTop: `3px solid ${T.accent}`,
              borderRadius: '50%',
              animation: 'spin .8s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{
              fontSize: 15,
              color: T.textSecondary,
              fontFamily: fontMono,
              animation: 'pulse 1.5s ease infinite',
            }}>
              Fetching {query.trim()}'s data...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: '#1C1007',
            border: '1px solid #3D2012',
            borderRadius: 10,
            padding: '16px 20px',
            marginTop: 32,
            animation: 'fadeIn .3s ease',
          }}>
            <p style={{
              color: '#F59E0B',
              fontFamily: fontMono,
              fontSize: 14,
            }}>
              ⚠ {error}
            </p>
          </div>
        )}

        {/* ─── Dashboard ─── */}
        {profile && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── A. Profile Card ── */}
            <div style={{
              ...cardStyle,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
              position: 'relative',
            }}>
              <img
                src={profile.avatar_url}
                alt={profile.login}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  border: `3px solid ${T.accent}`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: T.textPrimary,
                  lineHeight: 1.2,
                  marginBottom: 2,
                }}>
                  {profile.name || profile.login}
                </h1>
                <div style={{
                  fontFamily: fontMono,
                  fontSize: 14,
                  color: T.accent,
                  marginBottom: 8,
                }}>
                  @{profile.login}
                </div>
                {profile.bio && (
                  <p style={{
                    fontSize: 14,
                    color: T.textSecondary,
                    lineHeight: 1.5,
                    marginBottom: 16,
                    maxWidth: 550,
                  }}>
                    {profile.bio}
                  </p>
                )}

                {/* Stat Pills */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { label: 'PUBLIC REPOS', value: profile.public_repos },
                    { label: 'FOLLOWERS', value: profile.followers },
                    { label: 'FOLLOWING', value: profile.following },
                    { label: 'TOTAL STARS', value: totalStars },
                  ].map(stat => (
                    <div key={stat.label} style={{
                      background: T.bgSunken,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: '10px 16px',
                      textAlign: 'center',
                      minWidth: 100,
                    }}>
                      <div style={{
                        fontFamily: fontMono,
                        fontSize: 22,
                        fontWeight: 700,
                        color: T.accent,
                        lineHeight: 1.2,
                      }}>
                        {stat.value?.toLocaleString() ?? 0}
                      </div>
                      <div style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: T.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginTop: 4,
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              {profile.location && (
                <div style={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  fontFamily: fontMono,
                  fontSize: 13,
                  color: T.textSecondary,
                }}>
                  📍 {profile.location}
                </div>
              )}
            </div>

            {/* ── B. Activity Heatmap ── */}
            <div style={cardStyle}>
              <div style={sectionTitle}>
                <span style={{ fontSize: 16 }}>🔥</span>
                Activity — Last 6 Months
              </div>
              <div style={{
                overflowX: 'auto',
                paddingBottom: 8,
              }}>
                <div style={{
                  display: 'flex',
                  gap: 3,
                  width: 'fit-content',
                }}>
                  {heatmapWeeks.map((week, wi) => (
                    <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {week.map((day, di) => (
                        <div
                          key={di}
                          title={`${day.date}: ${day.count} event${day.count !== 1 ? 's' : ''}`}
                          style={{
                            width: 13,
                            height: 13,
                            borderRadius: 2,
                            background: heatColor(day.count),
                            cursor: 'pointer',
                            transition: 'transform .15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 12,
                  fontSize: 11,
                  color: T.textMuted,
                  fontFamily: fontMono,
                }}>
                  <span style={{ marginRight: 4 }}>Less</span>
                  {heatLegendColors.map((c, i) => (
                    <div key={i} style={{
                      width: 13,
                      height: 13,
                      borderRadius: 2,
                      background: c,
                    }} />
                  ))}
                  <span style={{ marginLeft: 4 }}>More</span>
                </div>
              </div>
            </div>

            {/* ── C. Two-Column Charts ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 20,
            }}>

              {/* Stars Bar Chart */}
              <div style={cardStyle}>
                <div style={sectionTitle}>
                  <span style={{ fontSize: 16 }}>⭐</span>
                  Stars by Repository
                </div>
                {starData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={starData} margin={{ top: 8, right: 8, bottom: 40, left: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fill: T.textMuted, fontFamily: fontMono, fontSize: 11 }}
                        angle={-35}
                        textAnchor="end"
                        axisLine={{ stroke: T.border }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: T.textMuted, fontFamily: fontMono, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,212,255,0.06)' }} />
                      <Bar dataKey="stars" fill={T.accent} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
                    No starred repos found
                  </div>
                )}
              </div>

              {/* Language Pie Chart */}
              <div style={cardStyle}>
                <div style={sectionTitle}>
                  <span style={{ fontSize: 16 }}>🧩</span>
                  Language Breakdown
                </div>
                {langData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={langData}
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                        stroke={T.bgSurface}
                        strokeWidth={2}
                      >
                        {langData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={val => <span style={{ color: T.textSecondary, fontSize: 12 }}>{val}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
                    No language data available
                  </div>
                )}
              </div>

              {/* Top Repositories */}
              <div style={cardStyle}>
                <div style={sectionTitle}>
                  <span style={{ fontSize: 16 }}>📦</span>
                  Top Repositories
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topRepos.map(repo => (
                    <div
                      key={repo.id}
                      id={`repo-${repo.name}`}
                      onClick={() => window.open(repo.html_url, '_blank')}
                      style={{
                        background: T.bgSunken,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'border-color .2s, transform .15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = T.borderHover;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = T.border;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        fontFamily: fontMono,
                        fontSize: 14,
                        fontWeight: 600,
                        color: T.accent,
                        marginBottom: 4,
                      }}>
                        {repo.name}
                      </div>
                      {repo.description && (
                        <div style={{
                          fontSize: 13,
                          color: T.textSecondary,
                          lineHeight: 1.4,
                          marginBottom: 10,
                        }}>
                          {truncate(repo.description, 80)}
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        fontSize: 12,
                        color: T.textMuted,
                        fontFamily: fontMono,
                      }}>
                        {repo.language && (
                          <span style={{
                            background: T.greenDark,
                            color: T.greenVivid,
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                          }}>
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stargazers_count?.toLocaleString()}</span>
                        <span>🍴 {repo.forks_count?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {topRepos.length === 0 && (
                    <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
                      No repositories found
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div style={cardStyle}>
                <div style={sectionTitle}>
                  <span style={{ fontSize: 16 }}>⚡</span>
                  Recent Activity
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {recentEvents.map((ev, i) => (
                    <div
                      key={ev.id || i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '12px 0',
                        borderBottom: i < recentEvents.length - 1 ? `1px solid ${T.border}` : 'none',
                      }}
                    >
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: T.accent,
                        marginTop: 5,
                        flexShrink: 0,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13,
                          color: T.textPrimary,
                          lineHeight: 1.4,
                        }}>
                          {eventDescription(ev)}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: T.textMuted,
                          fontFamily: fontMono,
                          marginTop: 3,
                        }}>
                          {timeAgo(ev.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentEvents.length === 0 && (
                    <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
                      No recent activity
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0',
        borderTop: `1px solid ${T.border}`,
        color: T.textMuted,
        fontSize: 12,
        fontFamily: fontMono,
      }}>
        GitPulse — built with React & Recharts
      </footer>
    </div>
  );
}
