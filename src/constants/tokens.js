export const T = {
  bgBase:       '#0D1117',
  bgSurface:    '#161B22',
  bgSunken:     '#0D1117',
  border:       '#21262D',
  borderHover:  '#30363D',
  textPrimary:  '#F0F6FC',
  textSecondary:'#8B949E',
  textMuted:    '#6E7681',
  greenDark:    '#0E4429',
  greenMid:     '#006D32',
  greenBright:  '#26A641',
  greenVivid:   '#39D353',
};

export const CHART_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#3B82F6', '#14B8A6'];
export const fontBody = "'Segoe UI', system-ui, sans-serif";
export const fontMono = "monospace";

export const THEME_ACCENTS = [
  { name: 'Cyan', value: '#00D4FF' },
  { name: 'Green', value: '#39D353' },
  { name: 'Purple', value: '#9061FF' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Amber', value: '#F59E0B' },
];

export const cardStyle = {
  background: 'rgba(22, 27, 34, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: 10,
  padding: 24,
  animation: 'fadeIn .4s ease',
  position: 'relative',
  overflow: 'hidden',
};

export const sectionTitle = {
  fontSize: 15,
  fontWeight: 600,
  color: T.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export const BP = { sm: 480, md: 768, lg: 1024 };

export const getGlobalCss = (accentColor) => `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bgBase}; font-family: ${fontBody}; color: ${T.textPrimary}; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bgBase}; }
  ::-webkit-scrollbar-thumb { background: ${T.borderHover}; border-radius: 3px; }
  input:focus, select:focus { border-color: ${accentColor} !important; box-shadow: 0 0 0 3px ${accentColor}26 !important; outline: none; }
  button:hover { opacity: 0.85; }
  button:active { transform: scale(0.97); }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes breathingGlow {
    0%, 100% { transform: scale(1); opacity: 0.25; filter: blur(20px); }
    50% { transform: scale(1.15); opacity: 0.45; filter: blur(24px); }
  }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes progress {
    0% { width: 0%; opacity: 1; }
    80% { width: 90%; opacity: 1; }
    100% { width: 100%; opacity: 0; }
  }
  @keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;
