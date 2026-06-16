import { useState } from 'react';
import { T, fontMono } from '../../constants/tokens';

function formatSize(kb) {
  if (!kb) return '0 KB';
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function RepoDrawer({ repo, onClose, accent }) {
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
