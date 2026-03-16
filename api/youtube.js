import { cors } from './config/middleware.js';

/**
 * YouTube integration using NewPipe-style HTML scraping.
 * Falls back to noembed/YouTube oEmbed for basic metadata if needed.
 * No API key needed.
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
 * Scrape YouTube playlist page directly.
 */
async function fetchPlaylistVideosScrape(playlistId) {
  try {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const response = await fetchWithHeaders(url);

    if (!response.ok) {
      return { items: [], playlistTitle: '', error: `YouTube ${response.status}` };
    }

    const html = await response.text();
    const data = extractInitialData(html);
    if (!data) return { items: [], playlistTitle: '', error: 'ytInitialData not found' };

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
 * Scrape YouTube search results.
 */
async function searchPlaylistsScrape(query) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' playlist')}&sp=EgIQAw%253D%253D`;
    const response = await fetchWithHeaders(searchUrl);

    if (!response.ok) return [];

    const html = await response.text();
    const data = extractInitialData(html);
    if (!data) {
      return [];
    }

    const results = [];
    const sectionContents = data?.contents?.twoColumnSearchResultsRenderer
      ?.primaryContents?.sectionListRenderer?.contents;
    
    if (!sectionContents) return [];


    for (const section of sectionContents) {
      const items = section?.itemSectionRenderer?.contents;
      if (!items) continue;

      for (const item of items) {
        // Old style (playlistRenderer)
        if (item.playlistRenderer) {
          const playlist = item.playlistRenderer;
          results.push({
            id: playlist.playlistId,
            title: playlist.title?.simpleText || playlist.title?.runs?.[0]?.text || '',
            thumbnail: playlist.thumbnails?.[0]?.thumbnails?.slice(-1)?.[0]?.url ||
              playlist.thumbnailRenderer?.playlistVideoThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url || '',
            videoCount: playlist.videoCount || playlist.videoCountText?.simpleText || '0',
            author: playlist.shortBylineText?.runs?.[0]?.text || '',
          });
        }
        // New style (lockupViewModel)
        else if (item.lockupViewModel) {
          const m = item.lockupViewModel;
          results.push({
            id: m.contentId,
            title: m.metadata?.lockupMetadataViewModel?.title?.content || 'Untitled',
            thumbnail: m.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel?.image?.sources?.[0]?.url || '',
            videoCount: m.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel?.overlays?.[0]?.thumbnailOverlayBadgeViewModel?.thumbnailBadges?.[0]?.thumbnailBadgeViewModel?.text || '0',
            author: m.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || '',
          });
        }
      }
    }

    // Limit to 12 results
    return results.slice(0, 12);
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

      console.log('[YouTube Search] Query:', q);
      const results = await searchPlaylistsScrape(q);
      return res.status(200).json({ results });
    }

    // ─── PLAYLIST ─────────────────────────────────
    const { playlistId } = req.query;

    if (!playlistId) {
      return res.status(400).json({ message: 'playlistId is required' });
    }

    console.log('[YouTube Playlist] ID:', playlistId);
    const { items, playlistTitle, error } = await fetchPlaylistVideosScrape(playlistId);

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
    console.error('[YouTube Scraper Error]', err);
    return res.status(500).json({
      message: 'Failed to extract YouTube data',
      error: err.message,
      source: 'newpipe_error',
    });
  }
}
