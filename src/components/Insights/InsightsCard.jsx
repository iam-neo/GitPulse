import { T, fontMono, sectionTitle, cardStyle } from '../../constants/tokens';

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

export default function InsightsCard({ profile, repos, events, totalStars, accent }) {
  const ageYears = profile?.created_at
    ? ((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)
    : null;
  const avgStars = repos?.length ? (totalStars / repos.length).toFixed(1) : 0;
  const { peakDay, peakHour } = analyzeActivity(events);

  return (
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
  );
}
