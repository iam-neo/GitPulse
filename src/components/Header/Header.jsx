import { useState } from 'react';
import { T, fontMono } from '../../constants/tokens';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import SearchBar from './SearchBar';
import HamburgerMenu from './HamburgerMenu';
import SettingsDropdown from './SettingsDropdown';

export default function Header({
  accent,
  onAccentChange,
  pat,
  onPatChange,
  onSavePat,
  onClearPat,
  rateLimit,
  compareMode,
  onCompareToggle,
  query,
  onQueryChange,
  onSearch,
  onLogoClick
}) {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    setShowSettings(false);
    onLogoClick();
  };

  const handleSearch = () => {
    setMobileMenuOpen(false);
    onSearch();
  };

  return (
    <header style={{
      background: `linear-gradient(180deg, ${T.bgSurface} 0%, ${T.bgBase} 100%)`,
      borderBottom: `1px solid ${T.border}`,
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: fontMono,
          fontWeight: 700,
          fontSize: 22,
          color: accent,
          letterSpacing: '-0.02em',
          userSelect: 'none',
          cursor: 'pointer',
        }} onClick={handleLogoClick}>
          {'<gh·track />'}
        </div>

        {/* Desktop Controls (>768px) */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
            
            <button
              onClick={onCompareToggle}
              style={{
                background: compareMode ? accent : 'transparent',
                border: `1px solid ${accent}`,
                color: compareMode ? T.bgBase : accent,
                borderRadius: 8,
                padding: '10px 16px',
                fontFamily: fontMono,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {compareMode ? 'EXIT COMPARE' : '⚔️ VS COMPARE'}
            </button>

            {rateLimit && (
              <div
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  fontFamily: fontMono,
                  fontSize: 11,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: rateLimit.remaining < 10 ? 'rgba(239, 68, 68, 0.15)' : T.bgSunken,
                  border: `1px solid ${rateLimit.remaining < 10 ? '#EF4444' : T.border}`,
                  color: rateLimit.remaining < 10 ? '#EF4444' : T.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  userSelect: 'none',
                }}
                title="Click to configure Settings & PAT"
              >
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: rateLimit.remaining < 10 ? '#EF4444' : accent,
                }} />
                API: {rateLimit.remaining}/{rateLimit.limit}
              </div>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: pat.trim() ? `${accent}1a` : T.bgSunken,
                border: `1px solid ${pat.trim() ? accent : T.border}`,
                color: pat.trim() ? accent : T.textSecondary,
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: fontMono,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <span>⚙️</span> Settings
            </button>

            {showSettings && (
              <SettingsDropdown
                accent={accent}
                onAccentChange={onAccentChange}
                pat={pat}
                onPatChange={onPatChange}
                onSave={onSavePat}
                onClear={onClearPat}
                rateLimit={rateLimit}
                isMobile={false}
              />
            )}

            {!compareMode && (
              <SearchBar
                query={query}
                onChange={onQueryChange}
                onSearch={handleSearch}
                accent={accent}
                fullWidth={false}
              />
            )}
          </div>
        )}

        {/* Mobile Hamburger Toggle Button (≤768px) */}
        {isMobile && (
          <HamburgerMenu
            isOpen={mobileMenuOpen}
            onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            accent={accent}
          />
        )}
      </div>

      {/* Mobile Menu Drawer (≤768px) */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: T.bgSurface,
          borderBottom: `1px solid ${T.border}`,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 49,
          animation: 'slideDown 0.3s ease-out forwards',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        }}>
          {/* Compare Button */}
          <button
            onClick={() => {
              onCompareToggle();
              setMobileMenuOpen(false);
            }}
            style={{
              width: '100%',
              background: compareMode ? accent : 'transparent',
              border: `1px solid ${accent}`,
              color: compareMode ? T.bgBase : accent,
              borderRadius: 8,
              padding: '12px',
              fontFamily: fontMono,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            {compareMode ? 'EXIT COMPARE' : '⚔️ VS COMPARE'}
          </button>

          {/* Search bar inside drawer */}
          {!compareMode && (
            <SearchBar
              query={query}
              onChange={onQueryChange}
              onSearch={handleSearch}
              accent={accent}
              fullWidth={true}
            />
          )}

          {/* Settings Section (always visible in Mobile Drawer for ease of access) */}
          <SettingsDropdown
            accent={accent}
            onAccentChange={onAccentChange}
            pat={pat}
            onPatChange={onPatChange}
            onSave={() => {
              onSavePat();
              setMobileMenuOpen(false);
            }}
            onClear={() => {
              onClearPat();
              setMobileMenuOpen(false);
            }}
            rateLimit={rateLimit}
            isMobile={true}
          />
        </div>
      )}
    </header>
  );
}
