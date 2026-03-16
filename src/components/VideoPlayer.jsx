import { AlertCircle } from 'lucide-react'

/**
 * extracts YouTube video ID from various URL formats
 */
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * VideoPlayer - renders a responsive YouTube embed player
 */
export default function VideoPlayer({ url }) {
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="video-wrapper" style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
        color: '#94A3B8', borderRadius: '16px', overflow: 'hidden'
      }}>
        <AlertCircle size={48} strokeWidth={1.5} color="#475569" />
        <p style={{ fontSize: 14, fontWeight: 500 }}>No video available for this lesson</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingTop: '56.25%', /* 16:9 Aspect Ratio */
      background: '#000',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
    }}>
      <iframe
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
