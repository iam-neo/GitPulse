import { T, fontMono, sectionTitle, cardStyle } from '../../constants/tokens';

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

export default function ActivityFeed({ events, accent }) {
  const recentEvents = events ? events.slice(0, 8) : [];

  return (
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
  );
}
