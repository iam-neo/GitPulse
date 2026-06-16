import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { T, fontMono, sectionTitle, cardStyle } from '../../constants/tokens';

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.bgSurface,
      border: `1px solid ${T.borderHover}`,
      borderRadius: 6,
      padding: '8px 12px',
      fontFamily: fontMono,
      fontSize: 12,
      color: T.textPrimary,
    }}>
      <div style={{ color: '#00D4FF', marginBottom: 2 }}>{label}</div>
      <div>⭐ {payload[0].value} stars</div>
    </div>
  );
}

export default function StarsBarChart({ repos, accent }) {
  const starData = repos
    .filter(r => r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map(r => ({ name: truncate(r.name, 15), stars: r.stargazers_count }));

  return (
    <div style={cardStyle}>
      <div style={sectionTitle}>
        <span style={{ fontSize: 16 }}>⭐</span>
        Stars by Repository
      </div>
      {starData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={starData} margin={{ top: 8, right: 8, bottom: 40, left: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.8}/>
                <stop offset="100%" stopColor={accent} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fill: T.textMuted, fontFamily: fontMono, fontSize: 11 }}
              angle={-35}
              textAnchor="end"
              axisLine={{ stroke: T.border }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: T.textMuted, fontFamily: fontMono, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="stars" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
          No starred repos found
        </div>
      )}
    </div>
  );
}
