import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { fontMono } from '../../constants/tokens';
import ShareCard from './ShareCard';

export default function ShareButton({ profile, repos, events, totalStars, accent }) {
  const cardRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | generating | done

  const handleExport = async () => {
    if (!cardRef.current) return;
    setStatus('generating');

    try {
      // Allow images from external domains (like GitHub avatars) to load properly.
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: null,
        scale: 2 // High resolution scale
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `gitpulse-${profile.login.toLowerCase()}.png`;
      link.href = url;
      link.click();

      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to export image:', err);
      setStatus('idle');
    }
  };

  const buttonText = () => {
    if (status === 'generating') return 'GENERATING...';
    if (status === 'done') return 'DOWNLOADED!';
    return 'SHARE PROFILE';
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={status === 'generating'}
        style={{
          background: accent,
          color: '#0D1117',
          border: 'none',
          borderRadius: 6,
          padding: '8px 12px',
          fontFamily: fontMono,
          fontSize: 12,
          fontWeight: 700,
          cursor: status === 'generating' ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'opacity 0.2s',
          opacity: status === 'generating' ? 0.7 : 1,
        }}
      >
        <span>📷</span> {buttonText()}
      </button>

      {/* Render the off-screen card template so html2canvas can target it */}
      <ShareCard
        cardRef={cardRef}
        profile={profile}
        repos={repos}
        events={events}
        totalStars={totalStars}
        accent={accent}
      />
    </>
  );
}
