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
function formatJoinedDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Joined ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function formatSize(kb) {
  if (!kb) return '0 KB';
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

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

  const [pat, setPat] = useState(() => localStorage.getItem('gitpulse_pat') || '');
  const [rateLimit, setRateLimit] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gitpulse_history') || '[]');
    } catch {
      return [];
    }
  });
  const [showSettings, setShowSettings] = useState(false);

  // Repo Explorer State
  const [repoSearch, setRepoSearch] = useState('');
  const [repoSort, setRepoSort] = useState('stars');
  const [repoLang, setRepoLang] = useState('All');

  const getHeaders = useCallback(() => {
    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (pat.trim()) {
      headers['Authorization'] = `token ${pat.trim()}`;
    }
    return headers;
  }, [pat]);

  const updateRateLimit = useCallback((headers) => {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    if (limit !== null && remaining !== null) {
      setRateLimit({
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: reset ? new Date(parseInt(reset, 10) * 1000).toLocaleTimeString() : null,
      });
    }
  }, []);

  const fetchRateLimit = useCallback(async () => {
    try {
      const res = await fetch('https://api.github.com/rate_limit', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRateLimit({
          limit: data.rate.limit,
          remaining: data.rate.remaining,
          reset: new Date(data.rate.reset * 1000).toLocaleTimeString(),
        });
      }
    } catch (e) {
      console.error('Failed to fetch rate limit', e);
    }
  }, [getHeaders]);

  const searchWithUsername = useCallback(async (username) => {
    if (!username) return;
    setLoading(true);
    setError('');
    setProfile(null);
    setRepos([]);
    setEvents([]);
    setTotalStars(0);
    setRepoSearch('');
    setRepoLang('All');

    try {
      const [profileRes, reposRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers: getHeaders() }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers: getHeaders() }),
        fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers: getHeaders() }),
      ]);

      updateRateLimit(profileRes.headers);

      if (profileRes.status === 404) {
        setError(`User "${username}" not found.`);
        window.history.pushState(null, '', window.location.pathname);
        return;
      }
      if (!profileRes.ok) {
        if (profileRes.status === 403) {
          setError('Rate limit exceeded. Click "Settings" in the header to provide a GitHub PAT.');
        } else {
          setError('GitHub API error. Try again.');
        }
        window.history.pushState(null, '', window.location.pathname);
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

      // Update history
      setHistory(prev => {
        let next = prev.filter(item => item.login.toLowerCase() !== profileData.login.toLowerCase());
        next.unshift({ login: profileData.login, avatarUrl: profileData.avatar_url });
        next = next.slice(0, 6);
        localStorage.setItem('gitpulse_history', JSON.stringify(next));
        return next;
      });

      // Update URL query param
      window.history.pushState(null, '', `?user=${profileData.login}`);
    } catch {
      setError('GitHub API error. Try again.');
      window.history.pushState(null, '', window.location.pathname);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, updateRateLimit]);

  const search = useCallback(() => {
    searchWithUsername(query);
  }, [searchWithUsername, query]);

  const handleKey = (e) => { if (e.key === 'Enter') search(); };

  const handleHistoryClick = useCallback((login) => {
    setQuery(login);
    searchWithUsername(login);
  }, [searchWithUsername]);

  // Load profile from URL query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      setQuery(userParam);
      searchWithUsername(userParam);
    }
  }, [searchWithUsername]);

  // Fetch rate limit on load and when PAT changes
  useEffect(() => {
    fetchRateLimit();
  }, [fetchRateLimit]);

  /* ─── Derived Data ─── */
  const starData = repos
    .filter(r => r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map(r => ({ name: truncate(r.name, 15), stars: r.stargazers_count }));

  const langMap = {};
  repos.forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  });
  const langData = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const uniqueLanguages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort();

  const filteredAndSortedRepos = repos
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(repoSearch.toLowerCase()) || 
        (repo.description && repo.description.toLowerCase().includes(repoSearch.toLowerCase()));
      const matchesLang = repoLang === 'All' || repo.language === repoLang;
      return matchesSearch && matchesLang;
    })
    .sort((a, b) => {
      if (repoSort === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (repoSort === 'forks') return (b.forks_count || 0) - (a.forks_count || 0);
      if (repoSort === 'size') return (b.size || 0) - (a.size || 0);
      if (repoSort === 'updated') return new Date(b.updated_at) - new Date(a.updated_at);
      return 0;
    });

  const displayRepos = filteredAndSortedRepos.slice(0, 6);
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

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
          {rateLimit && (
            <div
              onClick={() => setShowSettings(!showSettings)}
              style={{
                fontFamily: fontMono,
                fontSize: 11,
                padding: '6px 10px',
                borderRadius: 6,
                background: rateLimit.remaining < 10 ? 'rgba(239, 68, 68, 0.15)' : T.bgSunken,
                border: `1px solid ${rateLimit.remaining < 10 ? '#EF4444' : T.border}`,
                color: rateLimit.remaining < 10 ? '#EF4444' : T.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                userSelect: 'none',
              }}
              title="Click to configure GitHub Token"
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: rateLimit.remaining < 10 ? '#EF4444' : T.accent,
              }} />
              API: {rateLimit.remaining}/{rateLimit.limit}
            </div>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: pat.trim() ? 'rgba(0, 212, 255, 0.1)' : T.bgSunken,
              border: `1px solid ${pat.trim() ? T.accent : T.border}`,
              color: pat.trim() ? T.accent : T.textSecondary,
              borderRadius: 8,
              padding: '10px 14px',
              fontFamily: fontMono,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span>⚙️</span> Settings
          </button>

          {showSettings && (
            <div style={{
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
            }}>
              <h3 style={{ fontSize: 14, color: T.textPrimary, marginBottom: 8, fontFamily: fontMono }}>
                GitHub API Settings
              </h3>
              <p style={{ fontSize: 11, color: T.textSecondary, marginBottom: 12, lineHeight: 1.4 }}>
                GitHub limits unauthenticated requests. Provide a Personal Access Token (PAT) to increase limits to 5,000 reqs/hr.
              </p>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: T.textMuted, marginBottom: 4, fontFamily: fontMono }}>
                  Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
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
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => {
                    localStorage.setItem('gitpulse_pat', pat.trim());
                    fetchRateLimit();
                    setShowSettings(false);
                  }}
                  style={{
                    flex: 1,
                    background: T.accent,
                    color: T.bgBase,
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontFamily: fontMono,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  SAVE
                </button>
                <button
                  onClick={() => {
                    setPat('');
                    localStorage.removeItem('gitpulse_pat');
                    setTimeout(() => fetchRateLimit(), 0);
                    setShowSettings(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${T.border}`,
                    color: T.textSecondary,
                    borderRadius: 6,
                    padding: '6px 12px',
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
          )}

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
              width: 240,
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
            {history.length > 0 && (
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
                      onClick={() => handleHistoryClick(item.login)}
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
                        e.currentTarget.style.borderColor = T.accent;
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

            {/* Recent History row above profile card */}
            {history.length > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 12,
                fontFamily: fontMono,
                color: T.textMuted,
                animation: 'fadeIn .3s ease',
              }}>
                <span>Recent Pulses:</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {history.map((item) => (
                    <span
                      key={item.login}
                      onClick={() => handleHistoryClick(item.login)}
                      style={{
                        color: item.login.toLowerCase() === profile.login.toLowerCase() ? T.accent : T.textSecondary,
                        cursor: 'pointer',
                        textDecoration: item.login.toLowerCase() === profile.login.toLowerCase() ? 'underline' : 'none',
                        transition: 'color .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = T.accent}
                      onMouseLeave={e => {
                        if (item.login.toLowerCase() !== profile.login.toLowerCase()) {
                          e.currentTarget.style.color = T.textSecondary;
                        }
                      }}
                    >
                      {item.login}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}>
                  {profile.name || profile.login}
                  {profile.hireable && (
                    <span style={{
                      background: 'rgba(57, 211, 83, 0.1)',
                      border: `1px solid ${T.greenVivid}`,
                      borderRadius: 12,
                      padding: '2px 8px',
                      fontSize: 10,
                      color: T.greenVivid,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      animation: 'pulse 2s infinite',
                    }}>
                      <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: T.greenVivid,
                      }} />
                      Available for Hire
                    </span>
                  )}
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
                    marginBottom: 12,
                    maxWidth: 550,
                  }}>
                    {profile.bio}
                  </p>
                )}

                {/* Social details */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px 20px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: T.textSecondary,
                }}>
                  {profile.company && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💼</span>
                      <span style={{ color: T.textPrimary }}>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📍</span>
                      <span style={{ color: T.textPrimary }}>{profile.location}</span>
                    </div>
                  )}
                  {profile.blog && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🔗</span>
                      <a href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         style={{ color: T.accent, textDecoration: 'none' }}>
                        {truncate(profile.blog.replace(/^https?:\/\/(www\.)?/, ''), 25)}
                      </a>
                    </div>
                  )}
                  {profile.twitter_username && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🐦</span>
                      <a href={`https://twitter.com/${profile.twitter_username}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         style={{ color: T.accent, textDecoration: 'none' }}>
                        @{profile.twitter_username}
                      </a>
                    </div>
                  )}
                  {profile.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>✉️</span>
                      <a href={`mailto:${profile.email}`}
                         style={{ color: T.accent, textDecoration: 'none' }}>
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.created_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📅</span>
                      <span>{formatJoinedDate(profile.created_at)}</span>
                    </div>
                  )}
                </div>

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

              {/* Top Repositories Explorer */}
              <div style={cardStyle}>
                <div style={{
                  ...sectionTitle,
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 16 }}>📦</span>
                  Repository Explorer
                </div>

                <div style={{
                  fontSize: 11,
                  fontFamily: fontMono,
                  color: T.textMuted,
                  marginBottom: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Search, filter, and sort repositories</span>
                  <span>
                    Showing {displayRepos.length} of {filteredAndSortedRepos.length}
                  </span>
                </div>

                {/* Repo Filters Panel */}
                <div style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 16,
                  flexWrap: 'wrap',
                }}>
                  {/* Search Input */}
                  <input
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="Search repos..."
                    style={{
                      flex: '1 1 150px',
                      background: T.bgSunken,
                      border: `1px solid ${T.border}`,
                      borderRadius: 6,
                      padding: '8px 12px',
                      color: T.textPrimary,
                      fontFamily: fontBody,
                      fontSize: 12,
                      transition: 'border-color .2s',
                    }}
                  />
                  
                  {/* Language Selector */}
                  <select
                    value={repoLang}
                    onChange={(e) => setRepoLang(e.target.value)}
                    style={{
                      flex: '1 1 100px',
                      background: T.bgSunken,
                      border: `1px solid ${T.border}`,
                      borderRadius: 6,
                      padding: '8px',
                      color: T.textPrimary,
                      fontFamily: fontBody,
                      fontSize: 12,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="All">All Languages</option>
                    {uniqueLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>

                  {/* Sort Selector */}
                  <select
                    value={repoSort}
                    onChange={(e) => setRepoSort(e.target.value)}
                    style={{
                      flex: '1 1 100px',
                      background: T.bgSunken,
                      border: `1px solid ${T.border}`,
                      borderRadius: 6,
                      padding: '8px',
                      color: T.textPrimary,
                      fontFamily: fontBody,
                      fontSize: 12,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="stars">⭐ Stars</option>
                    <option value="forks">🍴 Forks</option>
                    <option value="size">💾 Size</option>
                    <option value="updated">📅 Updated</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {displayRepos.map(repo => {
                    const licenseName = repo.license?.spdx_id || repo.license?.name;
                    return (
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
                          gap: 12,
                          fontSize: 11,
                          color: T.textMuted,
                          fontFamily: fontMono,
                          flexWrap: 'wrap',
                        }}>
                          {repo.language && (
                            <span style={{
                              background: 'rgba(0, 212, 255, 0.1)',
                              color: T.accent,
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 600,
                            }}>
                              {repo.language}
                            </span>
                          )}
                          <span>⭐ {repo.stargazers_count?.toLocaleString() || 0}</span>
                          <span>🍴 {repo.forks_count?.toLocaleString() || 0}</span>
                          <span>💾 {formatSize(repo.size)}</span>
                          {licenseName && <span>📄 {licenseName}</span>}
                        </div>
                      </div>
                    );
                  })}
                  {filteredAndSortedRepos.length === 0 && (
                    <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
                      No matching repositories found
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
