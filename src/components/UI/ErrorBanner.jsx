import { fontMono } from '../../constants/tokens';

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: '#1C1007',
      border: '1px solid #3D2012',
      borderRadius: 10,
      padding: '16px 20px',
      marginTop: 32,
      animation: 'fadeIn .3s ease',
    }}>
      <p style={{
        color: '#F59E0B',
        fontFamily: fontMono,
        fontSize: 14,
      }}>
        ⚠ {message}
      </p>
    </div>
  );
}
