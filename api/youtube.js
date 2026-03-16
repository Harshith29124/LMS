import { cors } from './config/middleware.js';

/**
 * YouTube integration using robust recursive JSON scraping.
 * This method searches the entire YouTube response JSON for video/playlist objects,
 * making it resilient to frequent UI and structural changes.
 */

async function fetchWithHeaders(url) {
  return await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
}

function extractInitialData(html) {
  const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/window\["ytInitialData"\] = ({.*?});/s);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error('Failed to parse ytInitialData', e.message);
    }
  }
  return null;
}

/**
 * Robustly find all instances of a key in a nested object.
 */
function findAllByKey(obj, key, results = []) {
  if (!obj || typeof obj !== 'object') return results;
  if (obj[key]) results.push(obj[key]);
  Object.keys(obj).forEach(k => {
    findAllByKey(obj[k], key, results);
  });
  return results;
}

/**
 * Parses ytInitialData for playlist videos.
 */
function parsePlaylistData(data) {
  let playlistTitle = data?.metadata?.playlistMetadataRenderer?.title ||
    data?.header?.playlistHeaderRenderer?.title?.simpleText ||
    data?.header?.playlistHeaderRenderer?.title?.runs?.[0]?.text || '';

  // Heuristic: Search recursively for playlistVideoRenderer
  const vids = findAllByKey(data, 'playlistVideoRenderer');
  
  const items = vids.map((video, index) => {
    const videoId = video.videoId;
    if (!videoId) return null;

    const title = video.title?.runs?.[0]?.text || video.title?.simpleText || 'Untitled';
    const thumbnail = video.thumbnail?.thumbnails?.slice(-1)?.[0]?.url ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const duration = video.lengthText?.simpleText || '';

    return {
      _id: `yt_${videoId}`,
      videoId,
      title,
      description: '',
      thumbnail,
      position: index,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      duration,
      lessonOrder: index,
    };
  }).filter(Boolean);

  return { items, playlistTitle };
}

/**
 * Scrape YouTube search results.
 */
async function searchPlaylistsScrape(query) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' playlist')}&sp=EgIQAw%253D%253D`;
    const response = await fetchWithHeaders(searchUrl);

    if (!response.ok) return [];

    const html = await response.text();
    const data = extractInitialData(html);
    if (!data) return [];

    const results = [];
    
    // Search for playlistRenderer recursively
    const playlists = findAllByKey(data, 'playlistRenderer');
    playlists.forEach(playlist => {
       results.push({
          id: playlist.playlistId,
          title: playlist.title?.simpleText || playlist.title?.runs?.[0]?.text || '',
          thumbnail: playlist.thumbnails?.[0]?.thumbnails?.slice(-1)?.[0]?.url ||
            playlist.thumbnailRenderer?.playlistVideoThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url || '',
          videoCount: playlist.videoCount || playlist.videoCountText?.simpleText || '0',
          author: playlist.shortBylineText?.runs?.[0]?.text || '',
        });
    });

    // Search for lockupViewModel recursively (new YouTube search layout)
    const lockups = findAllByKey(data, 'lockupViewModel');
    lockups.forEach(m => {
      // Check if it's a playlist lockup
      const metadata = m.metadata?.lockupMetadataViewModel;
      const isPlaylist = m.contentId?.startsWith('PL') || 
                         m.contentImage?.collectionThumbnailViewModel || 
                         metadata?.metadata?.contentMetadataViewModel?.metadataRows?.some(r => 
                            r.metadataParts?.some(p => p.text?.content?.toLowerCase().includes('playlist'))
                         );
      
      if (isPlaylist && m.contentId) {
        results.push({
          id: m.contentId,
          title: metadata?.title?.content || 'Untitled',
          thumbnail: m.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel?.image?.sources?.[0]?.url || '',
          videoCount: m.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel?.overlays?.[0]?.thumbnailOverlayBadgeViewModel?.thumbnailBadges?.[0]?.thumbnailBadgeViewModel?.text || 'Playlist',
          author: metadata?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || '',
        });
      }
    });

    // Deduplicate by ID
    const seen = new Set();
    return results.filter(r => {
      if (!r.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    }).slice(0, 12);

  } catch (err) {
    console.error('[Search scrape error]', err.message);
    return [];
  }
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url.split('?')[0];

  try {
    // ─── SEARCH ───────────────────────────────────
    if (url.includes('/search')) {
      const { q } = req.query;
      if (!q) return res.status(400).json({ message: 'Query is required' });
      const results = await searchPlaylistsScrape(q);
      return res.status(200).json({ results });
    }

    // ─── PLAYLIST ─────────────────────────────────
    const { playlistId } = req.query;
    if (!playlistId) {
      return res.status(400).json({ message: 'playlistId is required' });
    }

    const response = await fetchWithHeaders(`https://www.youtube.com/playlist?list=${playlistId}`);
    if (!response.ok) return res.status(200).json({ items: [], totalResults: 0, source: 'error' });

    const html = await response.text();
    const data = extractInitialData(html);
    if (!data) return res.status(200).json({ items: [], totalResults: 0, source: 'no_data' });

    const { items, playlistTitle } = parsePlaylistData(data);

    return res.status(200).json({
      items,
      totalResults: items.length,
      source: 'recursive_scraping',
      playlistTitle,
    });

  } catch (err) {
    console.error('[YouTube Scraper Error]', err);
    return res.status(500).json({
      message: 'Failed to extract YouTube data',
      error: err.message,
    });
  }
}
