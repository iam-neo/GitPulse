import { T, fontMono } from '../../constants/tokens';

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function formatSize(kb) {
  if (!kb) return '0 KB';
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function RepoCard({ repo, accent, onClick }) {
  const licenseName = repo.license?.spdx_id || repo.license?.name;

  return (
    <div
      id={`repo-${repo.name}`}
      onClick={onClick}
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
}
