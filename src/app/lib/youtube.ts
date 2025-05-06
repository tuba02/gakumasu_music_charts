// src/lib/youtube.ts
import {
    YouTubeVideo,
    YouTubeApiResponse,
    YouTubeApiItem,
    HATSUHOSHI_CHANNEL_ID,
    HATSUHOSHI_MUSIC_PLAYLIST_ID
  } from '@/app/types';
  
  // YouTube API URL
  const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
  
  /**
   * YouTube APIのキーを環境変数から取得
   */
  const getApiKey = (): string => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key is not defined in environment variables');
    }
    return apiKey;
  };
  
  /**
   * APIレスポンスを安全に解析する
   */
  const safeJsonParse = async (response: Response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON:', text);
      throw new Error('Invalid JSON response from YouTube API');
    }
  };
  
  /**
   * プレイリストから動画IDのリストを取得
   */
  export const getVideoIdsFromPlaylist = async (playlistId: string, maxResults = 50): Promise<string[]> => {
    const apiKey = getApiKey();
    const videoIds: string[] = [];
    let nextPageToken: string | undefined;
    
    try {
      do {
        const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
        const url = `${YOUTUBE_API_URL}/playlistItems?part=contentDetails&maxResults=${maxResults}&playlistId=${playlistId}${pageTokenParam}&key=${apiKey}`;
        
        console.log('Fetching playlist items from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('YouTube API Error Response:', errorText);
          throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await safeJsonParse(response);
        console.log('Playlist API Response:', JSON.stringify(data, null, 2));
        
        if (!data.items || data.items.length === 0) {
          console.warn('No videos found in playlist');
          break;
        }
        
        const ids = data.items.map((item: any) => item.contentDetails.videoId);
        videoIds.push(...ids);
        
        nextPageToken = data.nextPageToken;
        
        // 最大50件までに制限
        if (videoIds.length >= 50) {
          console.log('Reached maximum number of videos (50)');
          break;
        }
      } while (nextPageToken);
      
      // 50件を超える場合は切り詰める
      const limitedVideoIds = videoIds.slice(0, 50);
      console.log(`Found ${limitedVideoIds.length} videos in playlist (limited to 50)`);
      return limitedVideoIds;
    } catch (error) {
      console.error('Error fetching video IDs:', error);
      throw error;
    }
  };
  
  /**
   * 動画IDのリストから動画の詳細情報を取得
   */
  export const getVideosDetails = async (videoIds: string[]): Promise<YouTubeVideo[]> => {
    if (videoIds.length === 0) {
      console.log('No video IDs to fetch details for');
      return [];
    }
    
    const apiKey = getApiKey();
    const videos: YouTubeVideo[] = [];
    
    // YouTube APIは一度に50個までの動画情報しか取得できないため
    // 50個ずつ分割して処理
    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      const url = `${YOUTUBE_API_URL}/videos?part=snippet,statistics&id=${chunk.join(',')}&key=${apiKey}`;
      
      console.log(`Fetching details for ${chunk.length} videos (${i + 1} to ${i + chunk.length} of ${videoIds.length})`);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('YouTube API Error Response:', errorText);
          throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await safeJsonParse(response);
        console.log(`Received details for ${data.items?.length || 0} videos`);
        
        if (data.items) {
          const formattedVideos = data.items.map((item: YouTubeApiItem) => ({
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
            viewCount: parseInt(item.statistics.viewCount || '0', 10),
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${item.id}`
          }));
          
          videos.push(...formattedVideos);
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
        throw error;
      }
    }
    
    console.log(`Successfully fetched details for ${videos.length} videos`);
    return videos;
  };
  
  /**
   * 初星学園のMusicプレイリストから動画を取得し、再生回数でソート
   */
  export const getHatsuhoshiVideosRanking = async (): Promise<YouTubeVideo[]> => {
    try {
      // Musicプレイリストから動画IDを取得
      const videoIds = await getVideoIdsFromPlaylist(HATSUHOSHI_MUSIC_PLAYLIST_ID);
      
      // 動画IDから詳細情報を取得
      const videos = await getVideosDetails(videoIds);
      
      // 再生回数で降順ソート
      return videos.sort((a, b) => b.viewCount - a.viewCount);
    } catch (error) {
      console.error('Error getting Hatsuhoshi videos ranking:', error);
      throw error;
    }
  };