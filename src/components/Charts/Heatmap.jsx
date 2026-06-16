import { T, fontMono, sectionTitle, cardStyle } from '../../constants/tokens';
import { useWindowWidth } from '../../hooks/useWindowWidth';

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

export default function Heatmap({ events, accent }) {
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const heatmapWeeks = buildHeatmap(events);
  const heatLegendColors = [T.bgSurface, T.greenDark, T.greenMid, T.greenBright, T.greenVivid];

  return (
    <div style={{ ...cardStyle, flex: 2 }}>
      <div style={sectionTitle}>
        <span style={{ fontSize: 16 }}>🔥</span>
        Activity — Last 6 Months
      </div>

      {isMobile && (
        <div style={{
          fontSize: 10,
          fontFamily: fontMono,
          color: T.textMuted,
          marginBottom: 8,
          fontStyle: 'italic',
        }}>
          ↔️ Scroll horizontally to view full timeline
        </div>
      )}

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
  );
}
