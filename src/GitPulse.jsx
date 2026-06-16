import { useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGitHub } from './hooks/useGitHub';
import { useWindowWidth } from './hooks/useWindowWidth';
import { T, fontMono, getGlobalCss } from './constants/tokens';

// UI Components
import ProgressBar from './components/UI/ProgressBar';
import Header from './components/Header/Header';
import CompareMode from './components/Compare/CompareMode';
import EmptyState from './components/UI/EmptyState';
import { DashboardSkeleton } from './components/UI/Skeleton';
import ErrorBanner from './components/UI/ErrorBanner';
import ProfileCard from './components/Profile/ProfileCard';
import Heatmap from './components/Charts/Heatmap';
import InsightsCard from './components/Insights/InsightsCard';
import StarsBarChart from './components/Charts/StarsBarChart';
import LanguagePieChart from './components/Charts/LanguagePieChart';
import RepoExplorer from './components/Repos/RepoExplorer';
import ActivityFeed from './components/Activity/ActivityFeed';

export default function GitPulse() {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  // Local storage state
  const [pat, setPat] = useLocalStorage('gitpulse_pat', '');
  const [accent, setAccent] = useLocalStorage('gitpulse_accent', '#00D4FF');
  const [history, setHistory] = useLocalStorage('gitpulse_history', []);
  const [compareMode, setCompareMode] = useLocalStorage('gitpulse_compareMode', false);

  // Temporary PAT state for settings editing
  const [tempPat, setTempPat] = useLocalStorage('gitpulse_temp_pat', pat);

  // Sync temp PAT when saved PAT changes
  useEffect(() => {
    setTempPat(pat);
  }, [pat, setTempPat]);

  // GitHub state via hook
  const {
    query, setQuery,
    loading, error, setError,
    profile, setProfile,
    repos, setRepos,
    events, setEvents,
    totalStars, setTotalStars,
    rateLimit, fetchRateLimit,
    queryA, setQueryA,
    queryB, setQueryB,
    profileA, setProfileA,
    profileB, setProfileB,
    reposA, setReposA,
    reposB, setReposB,
    eventsA, setEventsB, // Naming bug preserved
    loadingA, setLoadingA,
    loadingB, setLoadingB,
    errorA, setErrorA,
    errorB, setErrorB,
    totalStarsA, setTotalStarsA,
    totalStarsB, setTotalStarsB,
    searchWithUsername,
    searchCompareUser,
    handleHistoryClick
  } = useGitHub({ pat, setHistory });

  // URL query initialization on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      setQuery(userParam);
      searchWithUsername(userParam);
    }
  }, [searchWithUsername, setQuery]);

  // Fetch initial rate limit
  useEffect(() => {
    fetchRateLimit();
  }, [fetchRateLimit]);

  const handleLogoClick = () => {
    setCompareMode(false);
    setProfile(null);
    setProfileA(null);
    setProfileB(null);
    setQuery('');
    setQueryA('');
    setQueryB('');
    window.history.pushState(null, '', window.location.pathname);
  };

  const handleCompareToggle = () => {
    const nextMode = !compareMode;
    setCompareMode(nextMode);
    setProfile(null);
    setProfileA(null);
    setProfileB(null);
    setQuery('');
    setQueryA('');
    setQueryB('');
    window.history.pushState(null, '', window.location.pathname);
  };

  const handleHistoryItemClick = (login) => {
    handleHistoryClick(login, compareMode, profileA);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bgBase, color: T.textPrimary, display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Global CSS style injection */}
      <style>{getGlobalCss(accent)}</style>

      {/* Thin loading line indicator at top of page */}
      <ProgressBar loading={loading} accent={accent} />

      {/* Responsive Header */}
      <Header
        accent={accent}
        onAccentChange={setAccent}
        pat={tempPat}
        onPatChange={setTempPat}
        onSavePat={() => {
          setPat(tempPat.trim());
          fetchRateLimit();
        }}
        onClearPat={() => {
          setPat('');
          setTempPat('');
          localStorage.removeItem('gitpulse_pat');
          fetchRateLimit();
        }}
        rateLimit={rateLimit}
        compareMode={compareMode}
        onCompareToggle={handleCompareToggle}
        query={query}
        onQueryChange={setQuery}
        onSearch={() => searchWithUsername(query)}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content Area */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px', width: '100%', boxSizing: 'border-box', flex: 1 }}>
        
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
                  onClick={() => handleHistoryItemClick(item.login)}
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

        {/* ⚔️ COMPARE VS MODE ⚔️ */}
        {compareMode && (
          <CompareMode
            accent={accent}
            queryA={queryA}
            setQueryA={setQueryA}
            queryB={queryB}
            setQueryB={setQueryB}
            profileA={profileA}
            profileB={profileB}
            reposA={reposA}
            reposB={reposB}
            loadingA={loadingA}
            loadingB={loadingB}
            errorA={errorA}
            errorB={errorB}
            totalStarsA={totalStarsA}
            totalStarsB={totalStarsB}
            searchCompareUser={searchCompareUser}
          />
        )}

        {/* ─── STANDARD DASHBOARD CONTENT ─── */}
        {!compareMode && (
          <>
            {/* Empty landing page */}
            {!loading && !error && !profile && (
              <EmptyState
                history={history}
                onHistoryClick={handleHistoryItemClick}
                accent={accent}
              />
            )}

            {/* Dashboard Skeleton Loading State */}
            {loading && <DashboardSkeleton />}

            {/* Error alerts */}
            <ErrorBanner message={error} />

            {/* Loaded Profile Dashboards */}
            {profile && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Profile Card */}
                <ProfileCard
                  profile={profile}
                  totalStars={totalStars}
                  accent={accent}
                  repos={repos}
                  events={events}
                />

                {/* Analytical Insights and Heatmap Row */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 20,
                  width: '100%'
                }}>
                  <Heatmap events={events} accent={accent} />
                  <InsightsCard
                    profile={profile}
                    repos={repos}
                    events={events}
                    totalStars={totalStars}
                    accent={accent}
                  />
                </div>

                {/* Visual Charts Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: 20,
                  width: '100%'
                }}>
                  <StarsBarChart repos={repos} accent={accent} />
                  <LanguagePieChart repos={repos} />
                  <RepoExplorer repos={repos} accent={accent} />
                  <ActivityFeed events={events} accent={accent} />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
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
          v2.1.0 · Built with React & Recharts ·{' '}
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
