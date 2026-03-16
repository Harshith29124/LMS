import { AlertCircle } from 'lucide-react'

/**
 * Extracts YouTube video ID or Playlist ID from various URL formats.
 * Works with standard YouTube URLs — no API needed.
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
      <div className="w-full h-full min-h-[400px] bg-slate-100 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-6 border border-black/5 dark:border-white/5 p-12 rounded-[2.5rem]">
        <div className="w-20 h-20 rounded-[2rem] bg-slate-200 dark:bg-slate-800/30 flex items-center justify-center border border-black/5 dark:border-white/5">
           <AlertCircle size={40} className="text-slate-400" />
        </div>
        <div className="text-center space-y-2">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-widest">No Video</h4>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No video content available for this module.</p>
        </div>
      </div>
    );
  }

  const src = data.type === 'playlist' 
    ? `https://www.youtube.com/embed/videoseries?list=${data.id}&rel=0&modestbranding=1`
    : `https://www.youtube.com/embed/${data.id}?rel=0&modestbranding=1`;

  return (
    <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl bg-black">
      <iframe
        className="w-full h-full min-h-[400px] lg:min-h-[500px] border-0"
        src={src}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
