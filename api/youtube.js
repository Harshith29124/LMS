import { cors } from './config/middleware.js';

/**
 * YouTube integration using NewPipe-style approach.
 * Uses Invidious public API instances as proxy (no API key needed).
 * Falls back to noembed/YouTube oEmbed for basic metadata.
 * 
 * Supports:
 * - Playlist fetching: GET /api/youtube?playlistId=PLxxx
 * - Search: GET /api/youtube/search?q=query
 */

// Invidious instances to try (public, no auth needed — same approach as NewPipe)
const INVIDIOUS_INSTANCES = [
  'https://vid.puffyan.us',
  'https://invidious.fdn.fr',
  'https://y.com.sb',
  'https://invidious.nerdvpn.de',
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
  'https://iv.ggtyler.dev',
];

/**
 * Try fetching from multiple Invidious instances (resilient like NewPipe).
 */
async function fetchFromInvidious(path, retries = INVIDIOUS_INSTANCES.length) {
  for (let i = 0; i < retries; i++) {
    const instance = INVIDIOUS_INSTANCES[i % INVIDIOUS_INSTANCES.length];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${instance}${path}`, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      return await res.json();
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Fetches playlist videos using Invidious API (NewPipe-compatible, no key needed).
 */
async function fetchPlaylistVideos(playlistId) {
  try {
    const data = await fetchFromInvidious(`/api/v1/playlists/${playlistId}`);

    if (!data || !data.videos) {
      // Fallback: try scraping YouTube page directly
      return await fetchPlaylistVideosScrape(playlistId);
    }

    const items = data.videos.map((video, index) => ({
      _id: `yt_${video.videoId}`,
      videoId: video.videoId,
      title: video.title || 'Untitled',
      description: '',
      thumbnail: video.videoThumbnails?.[3]?.url ||
        video.videoThumbnails?.[0]?.url ||
        `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
      position: index,
      videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
      duration: formatDuration(video.lengthSeconds),
      lessonOrder: index,
    }));

    return {
      items,
      playlistTitle: data.title || '',
    };
  } catch (err) {
    console.error('[NewPipe-style playlist error]', err.message);
    return await fetchPlaylistVideosScrape(playlistId);
  }
}

/**
 * Fallback: scrape YouTube playlist page directly.
 */
async function fetchPlaylistVideosScrape(playlistId) {
  try {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return { items: [], playlistTitle: '', error: `YouTube ${response.status}` };
    }

    const html = await response.text();
    const ytMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
      html.match(/window\["ytInitialData"\] = ({.*?});/s);

    if (!ytMatch) {
      return { items: [], playlistTitle: '' };
    }

    const data = JSON.parse(ytMatch[1]);
    return parsePlaylistData(data);
  } catch (err) {
    console.error('[Scrape fallback error]', err.message);
    return { items: [], playlistTitle: '', error: err.message };
  }
}

/**
 * Parses ytInitialData JSON for playlist videos.
 */
function parsePlaylistData(data) {
  let playlistTitle = '';
  const items = [];

  try {
    const contents = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]
      ?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]
      ?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;

    playlistTitle = data?.metadata?.playlistMetadataRenderer?.title ||
      data?.header?.playlistHeaderRenderer?.title?.simpleText || '';

    if (!contents || !Array.isArray(contents)) return { items: [], playlistTitle };

    contents.forEach((item, index) => {
      const video = item?.playlistVideoRenderer;
      if (!video) return;

      const videoId = video.videoId;
      const title = video.title?.runs?.[0]?.text || video.title?.simpleText || 'Untitled';
      const thumbnail = video.thumbnail?.thumbnails?.slice(-1)?.[0]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const duration = video.lengthText?.simpleText || '';

      items.push({
        _id: `yt_${videoId}`,
        videoId,
        title,
        description: '',
        thumbnail,
        position: index,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        duration,
        lessonOrder: index,
      });
    });
  } catch (parseErr) {
    console.error('[Playlist parse error]', parseErr.message);
  }

  return { items, playlistTitle };
}

/**
 * Search YouTube playlists using Invidious API.
 */
async function searchPlaylists(query) {
  try {
    const path = `/api/v1/search?q=${encodeURIComponent(query)}&type=playlist&sort_by=relevance`;
    const data = await fetchFromInvidious(path);

    if (!data || !Array.isArray(data)) {
      // Fallback to scrape approach
      return await searchPlaylistsScrape(query);
    }

    return data
      .filter(item => item.type === 'playlist')
      .slice(0, 12)
      .map(pl => ({
        id: pl.playlistId,
        title: pl.title || '',
        thumbnail: pl.playlistThumbnail ||
          pl.videos?.[0]?.videoThumbnails?.[0]?.url ||
          `https://i.ytimg.com/vi/${pl.videos?.[0]?.videoId}/hqdefault.jpg`,
        videoCount: String(pl.videoCount || 0),
        author: pl.author || '',
      }));
  } catch (err) {
    console.error('[Invidious search error]', err.message);
    return await searchPlaylistsScrape(query);
  }
}

/**
 * Fallback: scrape YouTube search results.
 */
async function searchPlaylistsScrape(query) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' playlist')}&sp=EgIQAw%253D%253D`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const ytMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!ytMatch) return [];

    const data = JSON.parse(ytMatch[1]);
    const results = [];

    const sectionContents = data?.contents?.twoColumnSearchResultsRenderer
      ?.primaryContents?.sectionListRenderer?.contents;
    if (!sectionContents) return [];

    for (const section of sectionContents) {
      const items = section?.itemSectionRenderer?.contents;
      if (!items) continue;

      for (const item of items) {
        const playlist = item?.playlistRenderer;
        if (!playlist) continue;

        results.push({
          id: playlist.playlistId,
          title: playlist.title?.simpleText || playlist.title?.runs?.[0]?.text || '',
          thumbnail: playlist.thumbnails?.[0]?.thumbnails?.slice(-1)?.[0]?.url ||
            playlist.thumbnailRenderer?.playlistVideoThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url || '',
          videoCount: playlist.videoCount || playlist.videoCountText?.simpleText || '0',
          author: playlist.shortBylineText?.runs?.[0]?.text || '',
        });
      }
    }

    return results;
  } catch (err) {
    console.error('[Search scrape error]', err.message);
    return [];
  }
}

/**
 * Format seconds to MM:SS or HH:MM:SS.
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url.split('?')[0];

  try {
    // ─── SEARCH ───────────────────────────────────
    if (url.includes('/search')) {
      const { q } = req.query;
      if (!q) return res.status(400).json({ message: 'Query is required' });

      const results = await searchPlaylists(q);
      return res.status(200).json({ results });
    }

    // ─── PLAYLIST ─────────────────────────────────
    const { playlistId } = req.query;

    if (!playlistId) {
      return res.status(400).json({ message: 'playlistId is required' });
    }

    const { items, playlistTitle, error } = await fetchPlaylistVideos(playlistId);

    if (items.length === 0 && error) {
      return res.status(200).json({
        items: [],
        totalResults: 0,
        source: 'newpipe_fallback',
        playlistTitle: '',
        note: 'Playlist extraction failed. The embedded player will be used as fallback.',
      });
    }

    return res.status(200).json({
      items,
      totalResults: items.length,
      source: 'newpipe_extraction',
      playlistTitle,
    });

  } catch (err) {
    console.error('[YouTube NewPipe Error]', err);
    return res.status(500).json({
      message: 'Failed to extract YouTube data (NewPipe-style)',
      error: err.message,
      source: 'newpipe_error',
    });
  }
}
