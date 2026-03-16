import { cors, authenticate } from './config/middleware.js';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Fetches playlist items from YouTube Data API v3
 * GET /api/youtube?playlistId=PLxxx&maxResults=50
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { playlistId, maxResults = 50 } = req.query;

  if (!playlistId) {
    return res.status(400).json({ message: 'playlistId is required' });
  }

  if (!YOUTUBE_API_KEY) {
    // Fallback: return empty array if no API key configured
    // The frontend will gracefully handle this by showing the embedded playlist player
    return res.status(200).json({ items: [], source: 'no_api_key' });
  }

  try {
    // Fetch playlist items
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.error) {
      console.error('[YouTube API Error]', data.error);
      return res.status(200).json({ items: [], source: 'api_error', error: data.error.message });
    }

    const items = (data.items || []).map((item, index) => ({
      _id: `yt_${item.contentDetails.videoId}`,
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      position: item.snippet.position,
      videoUrl: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
      duration: '', // Duration requires a separate videos API call
      lessonOrder: index,
    }));

    // Optionally fetch video durations
    if (items.length > 0) {
      try {
        const videoIds = items.map(i => i.videoId).join(',');
        const durUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const durRes = await fetch(durUrl);
        const durData = await durRes.json();

        const durationMap = {};
        (durData.items || []).forEach(v => {
          // Parse ISO 8601 duration PT1H2M3S
          const match = v.contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (match) {
            const h = parseInt(match[1] || 0);
            const m = parseInt(match[2] || 0);
            const s = parseInt(match[3] || 0);
            durationMap[v.id] = h > 0 ? `${h}h ${m}m` : `${m}:${String(s).padStart(2, '0')}`;
          }
        });

        items.forEach(item => {
          item.duration = durationMap[item.videoId] || '';
        });
      } catch (durErr) {
        console.error('[Duration fetch error]', durErr);
      }
    }

    return res.status(200).json({
      items,
      totalResults: data.pageInfo?.totalResults || items.length,
      source: 'youtube_api',
    });
  } catch (err) {
    console.error('[YouTube API Handler Error]', err);
    return res.status(500).json({ message: 'Failed to fetch playlist data', error: err.message });
  }
}
