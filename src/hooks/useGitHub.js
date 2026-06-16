import { useState, useCallback } from 'react';

export function useGitHub({ pat, setHistory }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalStars, setTotalStars] = useState(0);

  const [rateLimit, setRateLimit] = useState(null);

  // Comparison VS Mode State
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [profileA, setProfileA] = useState(null);
  const [profileB, setProfileB] = useState(null);
  const [reposA, setReposA] = useState([]);
  const [reposB, setReposB] = useState([]);
  const [eventsA, setEventsB] = useState([]); // Keeping eventsA / setEventsB naming bug as requested
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState('');
  const [errorB, setErrorB] = useState('');
  const [totalStarsA, setTotalStarsA] = useState(0);
  const [totalStarsB, setTotalStarsB] = useState(0);

  const getHeaders = useCallback(() => {
    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (pat && pat.trim()) {
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

  const addToHistory = useCallback((login, avatarUrl) => {
    if (setHistory) {
      setHistory(prev => {
        let next = prev.filter(item => item.login.toLowerCase() !== login.toLowerCase());
        next.unshift({ login, avatarUrl });
        next = next.slice(0, 6);
        localStorage.setItem('gitpulse_history', JSON.stringify(next));
        return next;
      });
    }
  }, [setHistory]);

  const searchWithUsername = useCallback(async (username) => {
    if (!username) return;
    setLoading(true);
    setError('');
    setProfile(null);
    setRepos([]);
    setEvents([]);
    setTotalStars(0);

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

      addToHistory(profileData.login, profileData.avatar_url);

      window.history.pushState(null, '', `?user=${profileData.login}`);
    } catch {
      setError('GitHub API error. Try again.');
      window.history.pushState(null, '', window.location.pathname);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, updateRateLimit, addToHistory]);

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

      addToHistory(profileData.login, profileData.avatar_url);
    } catch {
      setErr('API error.');
    } finally {
      setLoad(false);
    }
  }, [getHeaders, updateRateLimit, addToHistory]);

  const handleHistoryClick = useCallback((login, compareMode, currentProfileA) => {
    if (compareMode) {
      if (!currentProfileA) {
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
  }, [searchWithUsername, searchCompareUser]);

  return {
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
    eventsA, setEventsB,
    loadingA, setLoadingA,
    loadingB, setLoadingB,
    errorA, setErrorA,
    errorB, setErrorB,
    totalStarsA, setTotalStarsA,
    totalStarsB, setTotalStarsB,
    searchWithUsername,
    searchCompareUser,
    handleHistoryClick
  };
}
