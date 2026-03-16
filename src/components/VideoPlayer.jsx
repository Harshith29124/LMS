import { AlertCircle, PlayCircle } from 'lucide-react'

/**
 * extracts YouTube video ID from various URL formats
 */
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function VideoPlayer({ url }) {
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-surface-900 flex flex-col items-center justify-center gap-6 border-2 border-white/5 p-12">
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

  return (
    <div className="relative w-full aspect-video bg-black group">
      {/* Decorative Border Overlay */}
      <div className="absolute inset-0 border-[8px] border-white/5 pointer-events-none z-10" />
      
      <iframe
        className="absolute top-0 left-0 w-full h-full border-0 grayscale-[20%] hover:grayscale-0 transition-all duration-700"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0&showinfo=0&controls=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Retro Signal Marker */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
         <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Asset Feed</span>
      </div>
    </div>
  );
}
