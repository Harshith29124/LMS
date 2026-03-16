import { cors } from './config/middleware.js';
import { Innertube } from 'youtubei.js';

/**
 * YouTube integration powered by youtubei.js (InnerTube API)
 * Supports:
 * - Playlist fetching: GET /api/youtube?playlistId=PLxxx
 * - Search: GET /api/youtube/search?q=query
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url.split('?')[0];

  try {
    const yt = await Innertube.create();

    // ─── SEARCH ───────────────────────────────────
    if (url.includes('/search')) {
      const { q } = req.query;
      if (!q) return res.status(400).json({ message: 'Query is required' });

      // Note: we can filter by playlists if that's what we want
      const search = await yt.search(q, { type: 'playlist' });
      
      const results = search.results.map(item => {
        if (item.type !== 'Playlist') return null;
        return {
          id: item.id,
          title: item.title.text,
          thumbnail: item.thumbnails[0]?.url || '',
          videoCount: item.video_count?.text || '0',
          author: item.author?.name || ''
        };
      }).filter(Boolean);

      return res.status(200).json({ results });
    }

    // ─── PLAYLIST ─────────────────────────────────
    const { playlistId } = req.query;

    if (!playlistId) {
      return res.status(400).json({ message: 'playlistId is required' });
    }

    const playlist = await yt.getPlaylist(playlistId);

    if (!playlist || !playlist.videos) {
      return res.status(200).json({ items: [], source: 'innertube_no_playlist' });
    }

    const items = playlist.videos.map((item, index) => {
      // Different objects might be returned depending on type
      if (item.type !== 'Video' && item.type !== 'PlaylistVideo') return null;

      return {
        _id: `yt_${item.id}`,
        videoId: item.id,
        title: item.title?.text || 'Untitled Video',
        description: '', // Desc not in compact view
        thumbnail: item.thumbnails?.[0]?.url || '',
        position: index,
        videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
        duration: item.duration?.text || '',
        lessonOrder: index,
      };
    }).filter(v => v !== null);

    return res.status(200).json({
      items,
      totalResults: items.length,
      source: 'innertube_api',
      playlistTitle: playlist.header?.title?.text || ''
    });

  } catch (err) {
    console.error('[YouTube InnerTube Error]', err);
    return res.status(500).json({ 
      message: 'Failed to interact with YouTube via InnerTube', 
      error: err.message,
      source: 'innertube_error'
    });
  }
}
