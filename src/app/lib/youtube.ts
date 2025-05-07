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
  
  // キャッシュの設定
  const CACHE_DURATION = 12 * 3600 * 1000;  // 12時間（ミリ秒）
  const CACHE_KEY = 'youtube_videos_cache';

  interface CacheData {
    videos: YouTubeVideo[];
    timestamp: number;
  }

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
   * キャッシュされたデータを取得
   */
  const getCachedData = (): CacheData | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CacheData = JSON.parse(cached);
      const now = Date.now();

      if (now - data.timestamp > CACHE_DURATION) {
        console.log(`Cache expired after ${CACHE_DURATION / 1000 / 60} minutes`);
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      const remainingTime = Math.round((CACHE_DURATION - (now - data.timestamp)) / 1000 / 60);
      console.log(`Using cached data (${remainingTime} minutes remaining)`);
      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  };

  /**
   * データをキャッシュに保存
   */
  const setCachedData = (videos: YouTubeVideo[]) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const data: CacheData = {
        videos,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      console.log(`Data cached for ${CACHE_DURATION / 1000 / 60} minutes`);
    } catch (error) {
      console.error('Error saving cache:', error);
    }
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
   * チャンネルの動画IDのリストを取得
   */
  export const getVideoIdsFromChannel = async (channelId: string, maxResults = 50): Promise<string[]> => {
    const apiKey = getApiKey();
    const videoIds: string[] = [];
    let nextPageToken: string | undefined;
    
    try {
      do {
        const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
        const url = `${YOUTUBE_API_URL}/search?part=id,snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video${pageTokenParam}&key=${apiKey}`;
        
        console.log('Fetching channel videos from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('YouTube API Error Response:', errorText);
          throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await safeJsonParse(response);
        console.log('Channel API Response:', JSON.stringify(data, null, 2));
        
        if (!data.items || data.items.length === 0) {
          console.warn('No videos found in channel');
          break;
        }
        
        // Single Promotion Videoを含む動画を除外
        const filteredItems = data.items.filter((item: any) => 
          !item.snippet.title.includes('Single Promotion Video')
        );
        
        const ids = filteredItems.map((item: any) => item.id.videoId);
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
      console.log(`Found ${limitedVideoIds.length} videos in channel (limited to 50)`);
      return limitedVideoIds;
    } catch (error) {
      console.error('Error fetching video IDs from channel:', error);
      throw error;
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
        const url = `${YOUTUBE_API_URL}/playlistItems?part=contentDetails,snippet&maxResults=${maxResults}&playlistId=${playlistId}${pageTokenParam}&key=${apiKey}`;
        
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
        
        // Single Promotion Videoを含む動画を除外
        const filteredItems = data.items.filter((item: any) => 
          !item.snippet.title.includes('Single Promotion Video')
        );
        
        const ids = filteredItems.map((item: any) => item.contentDetails.videoId);
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
            url: `https://www.youtube.com/watch?v=${item.id}`,
            previousViewCount: 0,  // 本番環境では前回のデータから取得
            viewCountIncrease: parseInt(item.statistics.viewCount || '0', 10),  // 本番環境では前回との差分を計算
            lastUpdated: new Date().toISOString()
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
   * 重複を除去した動画リストを作成
   */
  const removeDuplicates = (videos: YouTubeVideo[]): YouTubeVideo[] => {
    const uniqueVideos = new Map<string, YouTubeVideo>();
    
    videos.forEach(video => {
      if (!uniqueVideos.has(video.id)) {
        uniqueVideos.set(video.id, video);
      }
    });
    
    return Array.from(uniqueVideos.values());
  };
  
  type RankingPeriod = 'all' | 'monthly' | 'weekly' | 'daily';
  
  export async function getHatsuhoshiVideosRanking(): Promise<{ videos: YouTubeVideo[]; lastUpdated: string }> {
    try {
      // キャッシュされたデータを確認
      const cached = getCachedData();
      if (cached) {
        return {
          videos: cached.videos,
          lastUpdated: new Date(cached.timestamp).toISOString()
        };
      }

      console.log('Fetching fresh data from API');
      const response = await fetch('/api/youtube/ranking');
      if (!response.ok) {
        throw new Error('YouTube API error: ' + response.status);
      }
      const data = await response.json();

      // データをキャッシュに保存
      setCachedData(data);
      
      return {
        videos: data,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  }