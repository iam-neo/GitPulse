import { cardStyle } from '../../constants/tokens';

export function Skeleton({ width, height, borderRadius = 4, style }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, #161B22 25%, #21262D 50%, #161B22 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite linear',
      ...style
    }} />
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ ...cardStyle, display: 'flex', gap: 24, alignItems: 'center' }}>
        <Skeleton width={88} height={88} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width={180} height={24} style={{ marginBottom: 8 }} />
          <Skeleton width={120} height={16} style={{ marginBottom: 12 }} />
          <Skeleton width={320} height={16} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton width={90} height={40} borderRadius={8} />
            <Skeleton width={90} height={40} borderRadius={8} />
            <Skeleton width={90} height={40} borderRadius={8} />
          </div>
        </div>
      </div>
      <div style={cardStyle}>
        <Skeleton width={200} height={20} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {Array(26).fill(0).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Array(7).fill(0).map((_, j) => (
                <Skeleton key={j} width={13} height={13} borderRadius={2} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {Array(4).fill(0).map((_, i) => (
          <div key={i} style={cardStyle}>
            <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={200} />
          </div>
        ))}
      </div>
    </div>
  );
}
