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
  textPrimary:  '#F0F6FC',
  textSecondary:'#8B949E',
  textMuted:    '#6E7681',
  greenDark:    '#0E4429',
  greenMid:     '#006D32',
  greenBright:  '#26A641',
  greenVivid:   '#39D353',
};

const CHART_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#3B82F6', '#14B8A6'];
const fontBody = "'Segoe UI', system-ui, sans-serif";
const fontMono = "monospace";

const THEME_ACCENTS = [
  { name: 'Cyan', value: '#00D4FF' },
  { name: 'Green', value: '#39D353' },
  { name: 'Purple', value: '#9061FF' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Amber', value: '#F59E0B' },
];

/* ─── Global Styles Generator ─── */
const getGlobalCss = (accentColor) => `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bgBase}; font-family: ${fontBody}; color: ${T.textPrimary}; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bgBase}; }
  ::-webkit-scrollbar-thumb { background: ${T.borderHover}; border-radius: 3px; }
  input:focus, select:focus { border-color: ${accentColor} !important; box-shadow: 0 0 0 3px ${accentColor}26 !important; outline: none; }
  button:hover { opacity: 0.85; }
  button:active { transform: scale(0.97); }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes breathingGlow {
    0%, 100% { transform: scale(1); opacity: 0.25; filter: blur(20px); }
    50% { transform: scale(1.15); opacity: 0.45; filter: blur(24px); }
  }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes progress {
    0% { width: 0%; opacity: 1; }
    80% { width: 90%; opacity: 1; }
    100% { width: 100%; opacity: 0; }
  }
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

function getEventColor(type, accent) {
  switch (type) {
    case 'PushEvent': return '#39D353';
    case 'PullRequestEvent': return '#9061FF';
    case 'IssuesEvent': return '#EF4444';
    case 'WatchEvent': return '#F59E0B';
    case 'ForkEvent': return '#00D4FF';
    default: return accent;
  }
}

function getEventBadgeName(type) {
  switch (type) {
    case 'PushEvent': return 'PUSH';
    case 'PullRequestEvent': return 'PR';
    case 'IssuesEvent': return 'ISSUE';
    case 'WatchEvent': return 'STAR';
    case 'ForkEvent': return 'FORK';
    default: return 'ACT';
  }
}

function analyzeActivity(events) {
  if (!events || !events.length) return { peakDay: 'N/A', peakHour: 'N/A' };
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = Array(7).fill(0);
  const hourCounts = Array(24).fill(0);

  events.forEach(ev => {
    if (ev.created_at) {
      const d = new Date(ev.created_at);
      dayCounts[d.getDay()]++;
      hourCounts[d.getHours()]++;
    }
  });

  const maxDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
  const maxHour = hourCounts.indexOf(Math.max(...hourCounts));

  const peakDay = days[maxDayIdx];
  const startHour = maxHour;
  const endHour = (maxHour + 1) % 24;
  
  const formatHour = (h) => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };
  
  const peakHour = `${formatHour(startHour)} - ${formatHour(endHour)}`;

  return { peakDay, peakHour };
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
  background: 'rgba(22, 27, 34, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: 10,
  padding: 24,
  animation: 'fadeIn .4s ease',
  position: 'relative',
  overflow: 'hidden',
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

/* ─── Custom Bar Tooltip ─── */
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
      <div style={{ color: '#00D4FF', marginBottom: 2 }}>{label}</div>
      <div>⭐ {payload[0].value} stars</div>
    </div>
  );
}

/* ─── Custom Pie Label ─── */
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

/* ─── Reusable Shimmer Skeleton ─── */
function Skeleton({ width, height, borderRadius = 4, style }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, #161B22 25%, #21262D 50%, #161B22 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite linear',
      ...style
    }} />
  );
}

/* ─── Dashboard Skeleton Loaders ─── */
function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ ...cardStyle, display: 'flex', gap: 24, alignItems: 'center' }}>
        <Skeleton width={88} height={88} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width={180} height={24} style={{ marginBottom: 8 }} />
          <Skeleton width={120} height={16} style={{ marginBottom: 12 }} />
          <Skeleton width={320} height={16} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton width={90} height={40} borderRadius={8} />
            <Skeleton width={90} height={40} borderRadius={8} />
            <Skeleton width={90} height={40} borderRadius={8} />
          </div>
        </div>
      </div>
      <div style={cardStyle}>
        <Skeleton width={200} height={20} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {Array(26).fill(0).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Array(7).fill(0).map((_, j) => (
                <Skeleton key={j} width={13} height={13} borderRadius={2} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {Array(4).fill(0).map((_, i) => (
          <div key={i} style={cardStyle}>
            <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={200} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Repo Inspector Drawer ─── */
function RepositoryDrawer({ repo, onClose, accent }) {
  const [copied, setCopied] = useState('');

  if (!repo) return null;

  const licenseName = repo.license?.spdx_id || repo.license?.name || 'No License';
  const cloneHttps = `git clone ${repo.clone_url}`;
  const cloneSsh = `git clone ${repo.ssh_url}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.25s ease',
    }} onClick={onClose}>
      
      <div style={{
        background: T.bgSurface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 32,
        width: '90%',
        maxWidth: 580,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }} onClick={e => e.stopPropagation()}>
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: T.textSecondary,
            fontSize: 20,
            cursor: 'pointer',
            fontFamily: fontMono,
          }}
        >
          ✕
        </button>

        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.textPrimary, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            📦 {repo.name}
          </h2>
          <div style={{ fontSize: 12, fontFamily: fontMono, color: accent }}>
            {repo.full_name}
          </div>
        </div>

        {repo.description && (
          <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.5, background: T.bgSunken, padding: 12, borderRadius: 8, border: `1px solid ${T.border}` }}>
            {repo.description}
          </p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {[
            { label: 'Stars', value: `⭐ ${repo.stargazers_count || 0}` },
            { label: 'Forks', value: `🍴 ${repo.forks_count || 0}` },
            { label: 'Watchers', value: `👁️ ${repo.watchers_count || 0}` },
            { label: 'Open Issues', value: `🐛 ${repo.open_issues_count || 0}` },
            { label: 'Branch', value: `🌿 ${repo.default_branch || 'main'}` },
            { label: 'Size', value: `💾 ${formatSize(repo.size)}` },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: T.bgSunken,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '10px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{item.value}</div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.textMuted, fontFamily: fontMono, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <span>License: <span style={{ color: T.textPrimary }}>{licenseName}</span></span>
          <span>Created: <span style={{ color: T.textPrimary }}>{new Date(repo.created_at).toLocaleDateString()}</span></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, fontFamily: fontMono }}>Clone Commands</div>
          
          <div style={{ display: 'flex', background: T.bgSunken, border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden' }}>
            <span style={{ fontSize: 11, fontFamily: fontMono, color: T.textMuted, padding: '8px 12px', background: T.border, display: 'flex', alignItems: 'center' }}>HTTPS</span>
            <input readOnly value={cloneHttps} style={{ flex: 1, background: 'transparent', border: 'none', padding: '8px 12px', color: T.textPrimary, fontFamily: fontMono, fontSize: 11, outline: 'none' }} />
            <button
              onClick={() => copyToClipboard(cloneHttps, 'https')}
              style={{
                background: accent,
                color: T.bgBase,
                border: 'none',
                fontFamily: fontMono,
                fontSize: 10,
                fontWeight: 700,
                padding: '0 16px',
                cursor: 'pointer',
              }}
            >
              {copied === 'https' ? 'COPIED!' : 'COPY'}
            </button>
          </div>

          <div style={{ display: 'flex', background: T.bgSunken, border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden' }}>
            <span style={{ fontSize: 11, fontFamily: fontMono, color: T.textMuted, padding: '8px 12px', background: T.border, display: 'flex', alignItems: 'center' }}>SSH</span>
            <input readOnly value={cloneSsh} style={{ flex: 1, background: 'transparent', border: 'none', padding: '8px 12px', color: T.textPrimary, fontFamily: fontMono, fontSize: 11, outline: 'none' }} />
            <button
              onClick={() => copyToClipboard(cloneSsh, 'ssh')}
              style={{
                background: accent,
                color: T.bgBase,
                border: 'none',
                fontFamily: fontMono,
                fontSize: 10,
                fontWeight: 700,
                padding: '0 16px',
                cursor: 'pointer',
              }}
            >
              {copied === 'ssh' ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>

        <button
          onClick={() => window.open(repo.html_url, '_blank')}
          style={{
            background: 'transparent',
            border: `1px solid ${accent}`,
            color: accent,
            borderRadius: 8,
            padding: '12px',
            fontFamily: fontMono,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${accent}15`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          VIEW ON GITHUB ↗
        </button>

      </div>
    </div>
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

  // Advanced Configurations & Themes
  const [pat, setPat] = useState(() => localStorage.getItem('gitpulse_pat') || '');
  const [rateLimit, setRateLimit] = useState(null);
  const [accent, setAccent] = useState(() => localStorage.getItem('gitpulse_accent') || '#00D4FF');
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gitpulse_history') || '[]');
    } catch {
      return [];
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [inspectingRepo, setInspectingRepo] = useState(null);

  // Comparison VS Mode State
  const [compareMode, setCompareMode] = useState(false);
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [profileA, setProfileA] = useState(null);
  const [profileB, setProfileB] = useState(null);
  const [reposA, setReposA] = useState([]);
  const [reposB, setReposB] = useState([]);
  const [eventsA, setEventsB] = useState([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState('');
  const [errorB, setErrorB] = useState('');
  const [totalStarsA, setTotalStarsA] = useState(0);
  const [totalStarsB, setTotalStarsB] = useState(0);

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

      setHistory(prev => {
        let next = prev.filter(item => item.login.toLowerCase() !== profileData.login.toLowerCase());
        next.unshift({ login: profileData.login, avatarUrl: profileData.avatar_url });
        next = next.slice(0, 6);
        localStorage.setItem('gitpulse_history', JSON.stringify(next));
        return next;
      });

      window.history.pushState(null, '', `?user=${profileData.login}`);
    } catch {
      setError('GitHub API error. Try again.');
      window.history.pushState(null, '', window.location.pathname);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, updateRateLimit]);

  // Comparison Mode search flow
  const searchCompareUser = useCallback(async (side, username) => {
    if (!username) return;
    const isA = side === 'A';
    const setLoad = isA ? setLoadingA : setLoadingB;
    const setErr = isA ? setErrorA : setErrorB;
    const setProf = isA ? setProfileA : setProfileB;
    const setReps = isA ? setReposA : setReposB;
    const setStrs = isA ? setTotalStarsA : setTotalStarsB;

    setLoad(true);
    setErr('');
    setProf(null);
    setReps([]);
    setStrs(0);

    try {
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers: getHeaders() }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers: getHeaders() }),
      ]);

      updateRateLimit(profileRes.headers);

      if (profileRes.status === 404) {
        setErr(`"${username}" not found.`);
        return;
      }
      if (!profileRes.ok) {
        setErr('API error.');
        return;
      }

      const profileData = await profileRes.json();
      const reposData = await reposRes.json();

      const safeRepos = Array.isArray(reposData) ? reposData : [];

      setProf(profileData);
      setReps(safeRepos);
      setStrs(safeRepos.reduce((s, r) => s + (r.stargazers_count || 0), 0));

      setHistory(prev => {
        let next = prev.filter(item => item.login.toLowerCase() !== profileData.login.toLowerCase());
        next.unshift({ login: profileData.login, avatarUrl: profileData.avatar_url });
        next = next.slice(0, 6);
        localStorage.setItem('gitpulse_history', JSON.stringify(next));
        return next;
      });

    } catch {
      setErr('API error.');
    } finally {
      setLoad(false);
    }
  }, [getHeaders, updateRateLimit]);

  const search = useCallback(() => {
    searchWithUsername(query);
  }, [searchWithUsername, query]);

  const handleKey = (e) => { if (e.key === 'Enter') search(); };

  const handleHistoryClick = useCallback((login) => {
    if (compareMode) {
      if (!profileA) {
        setQueryA(login);
        searchCompareUser('A', login);
      } else {
        setQueryB(login);
        searchCompareUser('B', login);
      }
    } else {
      setQuery(login);
      searchWithUsername(login);
    }
  }, [searchWithUsername, searchCompareUser, compareMode, profileA]);

  // URL query initialization on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      setQuery(userParam);
      searchWithUsername(userParam);
    }
  }, [searchWithUsername]);

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

  // Insights Calculations
  const ageYears = profile?.created_at
    ? ((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)
    : null;
  const avgStars = repos.length ? (totalStars / repos.length).toFixed(1) : 0;
  const { peakDay, peakHour } = analyzeActivity(events);

  // VS Comparison Bar Graph Data
  const compareChartData = (profileA && profileB) ? [
    { name: 'Public Repos', [profileA.login]: profileA.public_repos, [profileB.login]: profileB.public_repos },
    { name: 'Followers', [profileA.login]: profileA.followers, [profileB.login]: profileB.followers },
    { name: 'Total Stars', [profileA.login]: totalStarsA, [profileB.login]: totalStarsB },
  ] : [];

  const userBColor = accent === '#9061FF' ? '#EC4899' : '#9061FF';

  /* ═══ RENDER ═══ */
  return (
    <div style={{ minHeight: '100vh', background: T.bgBase, fontFamily: fontBody, color: T.textPrimary }}>
      {loading && (
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
      )}
      <style>{getGlobalCss(accent)}</style>

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
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{
          fontFamily: fontMono,
          fontWeight: 700,
          fontSize: 22,
          color: accent,
          letterSpacing: '-0.02em',
          userSelect: 'none',
          cursor: 'pointer',
        }} onClick={() => {
          setCompareMode(false);
          setProfile(null);
          setQuery('');
          window.history.pushState(null, '', window.location.pathname);
        }}>
          {'<gh·track />'}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
          
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setProfile(null);
              setProfileA(null);
              setProfileB(null);
              setQuery('');
              setQueryA('');
              setQueryB('');
              window.history.pushState(null, '', window.location.pathname);
            }}
            style={{
              background: compareMode ? accent : 'transparent',
              border: `1px solid ${accent}`,
              color: compareMode ? T.bgBase : accent,
              borderRadius: 8,
              padding: '10px 16px',
              fontFamily: fontMono,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {compareMode ? 'EXIT COMPARE' : '⚔️ VS COMPARE'}
          </button>

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
              title="Click to configure Settings & PAT"
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: rateLimit.remaining < 10 ? '#EF4444' : accent,
              }} />
              API: {rateLimit.remaining}/{rateLimit.limit}
            </div>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: pat.trim() ? `${accent}1a` : T.bgSunken,
              border: `1px solid ${pat.trim() ? accent : T.border}`,
              color: pat.trim() ? accent : T.textSecondary,
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
                      onClick={() => {
                        setAccent(item.value);
                        localStorage.setItem('gitpulse_accent', item.value);
                      }}
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
                    background: accent,
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

          {!compareMode && (
            <>
              <input
                id="search-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search public profile..."
                style={{
                  background: T.bgSunken,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: T.textPrimary,
                  fontFamily: fontBody,
                  fontSize: 14,
                  width: 220,
                  transition: 'all .25s ease',
                }}
              />
              <button
                id="search-button"
                onClick={search}
                style={{
                  background: accent,
                  color: T.bgBase,
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 18px',
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
            </>
          )}
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Recent history horizontal trail */}
        {!compareMode && profile && !loading && history.length > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            fontSize: 12,
            fontFamily: fontMono,
            color: T.textMuted,
            animation: 'fadeIn .3s ease',
          }}>
            <span>Recent Bookmarks:</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {history.map((item) => (
                <span
                  key={item.login}
                  onClick={() => handleHistoryClick(item.login)}
                  style={{
                    color: item.login.toLowerCase() === profile.login.toLowerCase() ? accent : T.textSecondary,
                    cursor: 'pointer',
                    textDecoration: item.login.toLowerCase() === profile.login.toLowerCase() ? 'underline' : 'none',
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = accent}
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

        {/* ⚔️ COMPARE MODE SECTION ⚔️ */}
        {compareMode && (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            
            {/* Compare Search Header Bar */}
            <div style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 32,
              padding: 20,
              background: 'rgba(22, 27, 34, 0.5)',
              border: `1px solid ${T.border}`,
              borderRadius: 12,
            }}>
              {/* User A Input */}
              <div style={{ display: 'flex', gap: 8 }}>
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
                    fontFamily: fontBody,
                    fontSize: 13,
                    width: 180,
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
              <div style={{ display: 'flex', gap: 8 }}>
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
                    fontFamily: fontBody,
                    fontSize: 13,
                    width: 180,
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
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {errorA && <div style={{ flex: 1, color: '#EF4444', fontSize: 12, fontFamily: fontMono }}>⚠ Left: {errorA}</div>}
                {errorB && <div style={{ flex: 1, color: '#EF4444', fontSize: 12, fontFamily: fontMono }}>⚠ Right: {errorB}</div>}
              </div>
            )}

            {/* Compare Content grids */}
            {(!profileA && !profileB && !loadingA && !loadingB) && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: T.textSecondary }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>⚔️</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>VS Profile Duel</h2>
                <p style={{ fontSize: 14, maxWidth: 450, margin: '0 auto', lineHeight: 1.6 }}>
                  Enter usernames above to perform side-by-side comparative analysis of stars, followers, and languages.
                </p>
              </div>
            )}

            {/* Loading skeletons for split view */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              
              {/* Column A (Left) */}
              <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {loadingA && (
                  <div style={cardStyle}>
                    <Skeleton width={88} height={88} borderRadius="50%" style={{ marginBottom: 16 }} />
                    <Skeleton width={180} height={20} style={{ marginBottom: 8 }} />
                    <Skeleton width="100%" height={80} />
                  </div>
                )}
                {profileA && !loadingA && (
                  <div style={cardStyle}>
                    
                    {/* Glowing radial backdrop */}
                    <div style={{
                      position: 'absolute',
                      width: 160,
                      height: 160,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
                      top: -20,
                      left: -20,
                      zIndex: 0,
                      animation: 'breathingGlow 4s infinite ease-in-out',
                      pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', zIndex: 1, position: 'relative' }}>
                      <img src={profileA.avatar_url} style={{ width: 64, height: 64, borderRadius: '50%', border: `2px solid ${accent}` }} />
                      <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary }}>{profileA.name || profileA.login}</h2>
                        <div style={{ fontSize: 12, fontFamily: fontMono, color: accent }}>@{profileA.login}</div>
                        {profileA.bio && <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 4 }}>{truncate(profileA.bio, 80)}</p>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
                      {[
                        { label: 'Repos', val: profileA.public_repos },
                        { label: 'Followers', val: profileA.followers },
                        { label: 'Stars', val: totalStarsA },
                      ].map(item => (
                        <div key={item.label} style={{ flex: 1, background: T.bgSunken, border: `1px solid ${T.border}`, padding: 10, borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: accent, fontFamily: fontMono }}>{item.val}</div>
                          <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', marginTop: 2 }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Column B (Right) */}
              <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {loadingB && (
                  <div style={cardStyle}>
                    <Skeleton width={88} height={88} borderRadius="50%" style={{ marginBottom: 16 }} />
                    <Skeleton width={180} height={20} style={{ marginBottom: 8 }} />
                    <Skeleton width="100%" height={80} />
                  </div>
                )}
                {profileB && !loadingB && (
                  <div style={cardStyle}>
                    
                    <div style={{
                      position: 'absolute',
                      width: 160,
                      height: 160,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${userBColor}33 0%, transparent 70%)`,
                      top: -20,
                      left: -20,
                      zIndex: 0,
                      animation: 'breathingGlow 4s infinite ease-in-out',
                      pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', zIndex: 1, position: 'relative' }}>
                      <img src={profileB.avatar_url} style={{ width: 64, height: 64, borderRadius: '50%', border: `2px solid ${userBColor}` }} />
                      <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary }}>{profileB.name || profileB.login}</h2>
                        <div style={{ fontSize: 12, fontFamily: fontMono, color: userBColor }}>@{profileB.login}</div>
                        {profileB.bio && <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 4 }}>{truncate(profileB.bio, 80)}</p>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
                      {[
                        { label: 'Repos', val: profileB.public_repos },
                        { label: 'Followers', val: profileB.followers },
                        { label: 'Stars', val: totalStarsB },
                      ].map(item => (
                        <div key={item.label} style={{ flex: 1, background: T.bgSunken, border: `1px solid ${T.border}`, padding: 10, borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: userBColor, fontFamily: fontMono }}>{item.val}</div>
                          <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', marginTop: 2 }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verdict Verdict Banner & Comparative Charts */}
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
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', fontSize: 14 }}>
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
        )}

        {/* ─── STANDARD DASHBOARD CONTENT ─── */}
        {!compareMode && (
          <>
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
            )}

            {/* Loading State Skeleton */}
            {loading && <DashboardSkeleton />}

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

            {/* Main Loaded Profile Dashboard */}
            {profile && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ── A. Profile Card ── */}
                <div style={cardStyle}>
                  
                  {/* Subtle pulsing background glow matching the accent color */}
                  <div style={{
                    position: 'absolute',
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
                    top: -20,
                    left: -20,
                    zIndex: 0,
                    animation: 'breathingGlow 4s infinite ease-in-out',
                    pointerEvents: 'none',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative', zIndex: 1 }}>
                    <img
                      src={profile.avatar_url}
                      alt={profile.login}
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: '50%',
                        border: `3px solid ${accent}`,
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
                            background: 'rgba(57, 211, 83, 0.15)',
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
                        color: accent,
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
                               style={{ color: accent, textDecoration: 'none' }}>
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
                               style={{ color: accent, textDecoration: 'none' }}>
                              @{profile.twitter_username}
                            </a>
                          </div>
                        )}
                        {profile.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>✉️</span>
                            <a href={`mailto:${profile.email}`}
                               style={{ color: accent, textDecoration: 'none' }}>
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
                              color: accent,
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
                </div>

                {/* ── B. Analytical Insights & Heatmap ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                  
                  {/* Heatmap Card */}
                  <div style={{ ...cardStyle, flex: 2 }}>
                    <div style={sectionTitle}>
                      <span style={{ fontSize: 16 }}>🔥</span>
                      Activity — Last 6 Months
                    </div>
                    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 3, width: 'fit-content' }}>
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
                          <div key={i} style={{ width: 13, height: 13, borderRadius: 2, background: c }} />
                        ))}
                        <span style={{ marginLeft: 4 }}>More</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Analytics Insights Card */}
                  <div style={cardStyle}>
                    <div style={sectionTitle}>
                      <span style={{ fontSize: 16 }}>💡</span>
                      Pulse Analytics Insights
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                        <span style={{ color: T.textSecondary, fontSize: 13 }}>Account Age:</span>
                        <span style={{ fontFamily: fontMono, fontWeight: 600, color: accent }}>{ageYears} Years</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                        <span style={{ color: T.textSecondary, fontSize: 13 }}>Average Stars / Repo:</span>
                        <span style={{ fontFamily: fontMono, fontWeight: 600, color: accent }}>{avgStars} Stars</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                        <span style={{ color: T.textSecondary, fontSize: 13 }}>Peak Activity Day:</span>
                        <span style={{ fontFamily: fontMono, fontWeight: 600, color: accent }}>{peakDay}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 2 }}>
                        <span style={{ color: T.textSecondary, fontSize: 13 }}>Peak Activity Hour:</span>
                        <span style={{ fontFamily: fontMono, fontWeight: 600, color: accent }}>{peakHour}</span>
                      </div>

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
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={accent} stopOpacity={0.8}/>
                              <stop offset="100%" stopColor={accent} stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
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
                          <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                          <Bar dataKey="stars" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
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

                  {/* Repository Explorer */}
                  <div style={cardStyle}>
                    <div style={{ ...sectionTitle, marginBottom: 8 }}>
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
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
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
                            onClick={() => setInspectingRepo(repo)}
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
                              color: accent,
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
                                  background: `${accent}1a`,
                                  color: accent,
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

                  {/* Connected Git Timeline Recent Activity */}
                  <div style={cardStyle}>
                    <div style={sectionTitle}>
                      <span style={{ fontSize: 16 }}>⚡</span>
                      Recent Activity Feed
                    </div>

                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      paddingLeft: 12,
                      marginTop: 4,
                    }}>
                      
                      {/* Vertical connector line */}
                      {recentEvents.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          left: 4,
                          top: 8,
                          bottom: 8,
                          width: 2,
                          background: 'rgba(255, 255, 255, 0.06)',
                          zIndex: 0,
                        }} />
                      )}

                      {recentEvents.map((ev, i) => {
                        const eventColor = getEventColor(ev.type, accent);
                        const badgeName = getEventBadgeName(ev.type);
                        const firstCommitMsg = ev.payload?.commits?.[0]?.message;

                        return (
                          <div
                            key={ev.id || i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 16,
                              paddingBottom: 24,
                              position: 'relative',
                              zIndex: 1,
                            }}
                          >
                            {/* Branch connector status dot */}
                            <div style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: eventColor,
                              border: `2px solid ${T.bgSurface}`,
                              marginTop: 5,
                              marginLeft: -5,
                              flexShrink: 0,
                              boxShadow: `0 0 8px ${eventColor}`,
                            }} />

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                <span style={{
                                  background: `${eventColor}1c`,
                                  border: `1px solid ${eventColor}50`,
                                  color: eventColor,
                                  fontSize: 9,
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  fontFamily: fontMono,
                                }}>
                                  {badgeName}
                                </span>
                                <span style={{ fontSize: 11, color: T.textMuted, fontFamily: fontMono }}>
                                  {timeAgo(ev.created_at)}
                                </span>
                              </div>

                              <div style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.4 }}>
                                {eventDescription(ev)}
                              </div>

                              {/* Parse commit messages if present */}
                              {ev.type === 'PushEvent' && firstCommitMsg && (
                                <div style={{
                                  marginTop: 6,
                                  padding: '6px 10px',
                                  background: T.bgSunken,
                                  border: `1px solid ${T.border}`,
                                  borderRadius: 6,
                                  fontFamily: fontMono,
                                  fontSize: 11,
                                  color: T.textSecondary,
                                }}>
                                  📝 {truncate(firstCommitMsg, 60)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {recentEvents.length === 0 && (
                        <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
                          No recent activity found
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Inspector Drawer Overlay ─── */}
      <RepositoryDrawer
        repo={inspectingRepo}
        onClose={() => setInspectingRepo(null)}
        accent={accent}
      />

      {/* ─── Footer ─── */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0',
        borderTop: `1px solid ${T.border}`,
        color: T.textMuted,
        fontSize: 12,
        fontFamily: fontMono,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'center',
      }}>
        <div style={{ color: accent, fontWeight: 700, fontSize: 14 }}>
          {'<git·pulse />'}
        </div>
        <div>
          v2.0.0 · Built with React & Recharts ·{' '}
          <a
            href="https://github.com/iam-neo/GitPulse"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: accent, textDecoration: 'none' }}
          >
            View on GitHub ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
