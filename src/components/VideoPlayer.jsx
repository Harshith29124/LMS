import { AlertCircle } from 'lucide-react'

/**
 * extracts YouTube video ID or Playlist ID from various URL formats
 */
function getYouTubeData(url) {
  if (!url) return null;
  
  // Playlist detection
  const playlistMatch = url.match(/[?&]list=([^#&?]*)/);
  if (playlistMatch) return { type: 'playlist', id: playlistMatch[1] };

  // Video ID detection
  const videoRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const videoMatch = url.match(videoRegExp);
  if (videoMatch && videoMatch[2].length === 11) {
    return { type: 'video', id: videoMatch[2] };
  }

  // Fallback: if the string itself looks like a playlist ID (starts with PL)
  if (url.startsWith('PL') && url.length > 15) {
    return { type: 'playlist', id: url };
  }

  // Fallback: if the string itself looks like a video ID (11 chars)
  if (url.length === 11) {
    return { type: 'video', id: url };
  }

  return null;
}

export default function VideoPlayer({ url }) {
  const data = getYouTubeData(url);

  if (!data) {
    return (
      <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-6 border-2 border-white/5 p-12 rounded-[2.5rem]">
        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
           <AlertCircle size={40} className="text-slate-600" />
        </div>
        <div className="text-center space-y-2">
            <h4 className="text-lg font-bold text-white uppercase tracking-widest">Signal Missing</h4>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No visual asset detected for this module.</p>
        </div>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const src = data.type === 'playlist' 
    ? `https://www.youtube.com/embed/videoseries?list=${data.id}&rel=0&modestbranding=1&origin=${origin}`
    : `https://www.youtube.com/embed/${data.id}?rel=0&modestbranding=1&origin=${origin}&autoplay=0`;

  return (
    <div className="relative w-full aspect-video bg-black group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
      <iframe
        className="absolute top-0 left-0 w-full h-full border-0 transition-opacity duration-700 hover:opacity-100"
        src={src}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      {/* Subtle HUD Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
         <span className="text-[9px] font-black text-white uppercase tracking-widest">Secure Feed</span>
      </div>
    </div>
  );
}
