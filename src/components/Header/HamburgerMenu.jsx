import { T } from '../../constants/tokens';

export default function HamburgerMenu({ isOpen, onToggle, accent }) {
  const lineStyle = {
    width: 24,
    height: 2,
    background: isOpen ? accent : T.textPrimary,
    transition: 'all 0.3s ease',
    borderRadius: 1,
  };

  return (
    <button
      onClick={onToggle}
      aria-label="Toggle Menu"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: 24,
        height: 18,
        padding: 0,
        outline: 'none',
        zIndex: 100,
      }}
    >
      <div style={{
        ...lineStyle,
        transformOrigin: 'top left',
        transform: isOpen ? 'rotate(45deg) translate(3px, 1px)' : 'none',
      }} />
      <div style={{
        ...lineStyle,
        opacity: isOpen ? 0 : 1,
        transform: isOpen ? 'translateX(-10px)' : 'none',
      }} />
      <div style={{
        ...lineStyle,
        transformOrigin: 'bottom left',
        transform: isOpen ? 'rotate(-45deg) translate(3px, -1px)' : 'none',
      }} />
    </button>
  );
}
