import { useState } from 'react';
import { T, fontMono, sectionTitle, cardStyle } from '../../constants/tokens';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import RepoCard from './RepoCard';
import RepoDrawer from './RepoDrawer';

export default function RepoExplorer({ repos, accent }) {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [repoSearch, setRepoSearch] = useState('');
  const [repoSort, setRepoSort] = useState('stars');
  const [repoLang, setRepoLang] = useState('All');
  const [repoLimit, setRepoLimit] = useState(6);
  const [inspectingRepo, setInspectingRepo] = useState(null);

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

  const displayRepos = filteredAndSortedRepos.slice(0, repoLimit);

  return (
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
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 8,
        marginBottom: 16
      }}>
        <input
          value={repoSearch}
          onChange={(e) => {
            setRepoSearch(e.target.value);
            setRepoLimit(6);
          }}
          placeholder="Search repos..."
          style={{
            flex: '1 1 150px',
            background: T.bgSunken,
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            padding: '8px 12px',
            color: T.textPrimary,
            fontFamily: fontMono,
            fontSize: 12,
            transition: 'border-color .2s',
          }}
        />
        
        <select
          value={repoLang}
          onChange={(e) => {
            setRepoLang(e.target.value);
            setRepoLimit(6);
          }}
          style={{
            flex: '1 1 100px',
            background: T.bgSunken,
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            padding: '8px',
            color: T.textPrimary,
            fontFamily: fontMono,
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
            fontFamily: fontMono,
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
        {displayRepos.map(repo => (
          <RepoCard
            key={repo.id}
            repo={repo}
            accent={accent}
            onClick={() => setInspectingRepo(repo)}
          />
        ))}
        {filteredAndSortedRepos.length === 0 && (
          <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
            No matching repositories found
          </div>
        )}
      </div>

      {filteredAndSortedRepos.length > displayRepos.length && (
        <button
          onClick={() => setRepoLimit(prev => prev + 6)}
          style={{
            width: '100%',
            background: T.bgSunken,
            border: `1px solid ${T.border}`,
            color: accent,
            borderRadius: 8,
            padding: '10px',
            fontFamily: fontMono,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 12,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.background = `${accent}0a`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = T.border;
            e.currentTarget.style.background = T.bgSunken;
          }}
        >
          SHOW MORE REPOSITORIES ▾
        </button>
      )}

      <RepoDrawer
        repo={inspectingRepo}
        onClose={() => setInspectingRepo(null)}
        accent={accent}
      />
    </div>
  );
}
