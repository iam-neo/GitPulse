import { T, fontBody, fontMono } from '../../constants/tokens';

export default function SearchBar({ query, onChange, onSearch, accent, fullWidth }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: fullWidth ? 'column' : 'row',
      gap: 8,
      width: fullWidth ? '100%' : 'auto',
    }}>
      <input
        id="search-input"
        value={query}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search public profile..."
        style={{
          background: T.bgSunken,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: '10px 16px',
          color: T.textPrimary,
          fontFamily: fontBody,
          fontSize: 14,
          width: fullWidth ? '100%' : 220,
          transition: 'all .25s ease',
        }}
      />
      <button
        id="search-button"
        onClick={onSearch}
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
          width: fullWidth ? '100%' : 'auto',
        }}
      >
        SEARCH
      </button>
    </div>
  );
}
