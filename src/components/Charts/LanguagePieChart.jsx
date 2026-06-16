import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { T, CHART_COLORS, fontMono, sectionTitle, cardStyle } from '../../constants/tokens';

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill={T.textPrimary} textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontFamily: fontMono, fontWeight: 600 }}>
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function LanguagePieChart({ repos }) {
  const langMap = {};
  repos.forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  });
  const langData = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return (
    <div style={cardStyle}>
      <div style={sectionTitle}>
        <span style={{ fontSize: 16 }}>🧩</span>
        Language Breakdown
      </div>
      {langData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={langData}
              cx="50%"
              cy="50%"
              outerRadius={75}
              dataKey="value"
              label={renderPieLabel}
              labelLine={false}
              stroke={T.bgSurface}
              strokeWidth={2}
            >
              {langData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={val => <span style={{ color: T.textSecondary, fontSize: 12 }}>{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ color: T.textMuted, fontFamily: fontMono, fontSize: 13, textAlign: 'center', padding: 40 }}>
          No language data available
        </div>
      )}
    </div>
  );
}
