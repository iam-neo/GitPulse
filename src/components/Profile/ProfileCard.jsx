import { useState } from 'react';
import { T, fontMono } from '../../constants/tokens';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import StatPill from './StatPill';
import ShareButton from '../ShareCard/ShareButton';

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

export default function ProfileCard({ profile, totalStars, accent, repos, events }) {
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?user=${profile.login}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{
      background: 'rgba(22, 27, 34, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 10,
      padding: isMobile ? 20 : 24,
      animation: 'fadeIn .4s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
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

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        textAlign: isMobile ? 'center' : 'left',
        gap: 24,
        position: 'relative',
        zIndex: 1
      }}>
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
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 8
          }}>
            <div>
              <h1 style={{
                fontSize: 24,
                fontWeight: 700,
                color: T.textPrimary,
                lineHeight: 1.2,
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
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
              }}>
                @{profile.login}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-end',
              marginTop: isMobile ? 8 : 0
            }}>
              <ShareButton
                profile={profile}
                repos={repos}
                events={events}
                totalStars={totalStars}
                accent={accent}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  background: 'transparent',
                  border: `1px solid ${accent}`,
                  color: accent,
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontFamily: fontMono,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${accent}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>🔗</span> {copiedLink ? 'LINK COPIED!' : 'COPY SHARE LINK'}
              </button>
            </div>
          </div>

          {profile.bio && (
            <p style={{
              fontSize: 14,
              color: T.textSecondary,
              lineHeight: 1.5,
              marginBottom: 12,
              maxWidth: 550,
              margin: isMobile ? '0 auto 12px' : '0 0 12px',
            }}>
              {profile.bio}
            </p>
          )}

          {/* Social details */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
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

          {/* Stat Pills Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 12,
            width: '100%',
          }}>
            <StatPill label="PUBLIC REPOS" value={profile.public_repos} accent={accent} />
            <StatPill label="FOLLOWERS" value={profile.followers} accent={accent} />
            <StatPill label="FOLLOWING" value={profile.following} accent={accent} />
            <StatPill label="TOTAL STARS" value={totalStars} accent={accent} />
          </div>
        </div>
      </div>
    </div>
  );
}
