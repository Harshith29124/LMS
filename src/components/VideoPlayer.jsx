import { AlertCircle } from 'lucide-react'

/**
 * extracts YouTube video ID or Playlist ID from various URL formats
 */
function getYouTubeData(url) {
  if (!url) return null;
  
  const playlistMatch = url.match(/[?&]list=([^#&?]*)/);
  if (playlistMatch) return { type: 'playlist', id: playlistMatch[1] };

  const videoRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const videoMatch = url.match(videoRegExp);
  if (videoMatch && videoMatch[2].length === 11) {
    return { type: 'video', id: videoMatch[2] };
  }

  if (url.startsWith('PL') && url.length > 15) {
    return { type: 'playlist', id: url };
  }

  if (url.length === 11) {
    return { type: 'video', id: url };
  }

  return null;
}

export default function VideoPlayer({ url }) {
  const data = getYouTubeData(url);

  if (!data) {
    return (
      <div className="w-full h-full min-h-[400px] bg-surface-950 flex flex-col items-center justify-center gap-6 border border-white/5 p-12 rounded-[2.5rem]">
        <div className="w-20 h-20 rounded-[2rem] bg-slate-800/30 flex items-center justify-center border border-white/5">
           <AlertCircle size={40} className="text-slate-600" />
        </div>
        <div className="text-center space-y-2">
            <h4 className="text-lg font-bold text-white uppercase tracking-widest">Signal Missing</h4>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No visual asset detected for this module.</p>
        </div>
      </div>
    );
  }

  const src = data.type === 'playlist' 
    ? `https://www.youtube.com/embed/videoseries?list=${data.id}&rel=0&modestbranding=1`
    : `https://www.youtube.com/embed/${data.id}?rel=0&modestbranding=1`;

  return (
    <div className="w-full h-full relative group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
      <iframe
        className="w-full h-full min-h-[400px] lg:min-h-[500px] border-0"
        src={src}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
         <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Feed</span>
      </div>
    </div>
  );
}
