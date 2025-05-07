// src/lib/youtube.ts
import {
    YouTubeVideo,
    YouTubeApiResponse,
    YouTubeApiItem,
    HATSUHOSHI_CHANNEL_ID,
    HATSUHOSHI_MUSIC_PLAYLIST_ID
  } from '@/app/types';
import { getLastUpdateTime, updateLastFetchTime, updateLastStatsTime, supabase } from './db';
  
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
      console.error('YouTube API key is not defined in environment variables');
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
  export const getVideoIdsFromChannel = async (channelId: string, maxResults = 100): Promise<string[]> => {
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
        
        // 最大100件までに制限
        if (videoIds.length >= 100) {
          console.log('Reached maximum number of videos (100)');
          break;
        }
      } while (nextPageToken);
      
      // 100件を超える場合は切り詰める
      const limitedVideoIds = videoIds.slice(0, 100);
      console.log(`Found ${limitedVideoIds.length} videos in channel (limited to 100)`);
      return limitedVideoIds;
    } catch (error) {
      console.error('Error fetching video IDs from channel:', error);
      throw error;
    }
  };
  
  /**
   * プレイリストから動画IDのリストを取得
   */
  export const getVideoIdsFromPlaylist = async (playlistId: string, maxResults = 100): Promise<string[]> => {
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
        
        // 最大100件までに制限
        if (videoIds.length >= 100) {
          console.log('Reached maximum number of videos (100)');
          break;
        }
      } while (nextPageToken);
      
      // 100件を超える場合は切り詰める
      const limitedVideoIds = videoIds.slice(0, 100);
      console.log(`Found ${limitedVideoIds.length} videos in playlist (limited to 100)`);
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
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key is not set');
    }

    const videos: YouTubeVideo[] = [];
    const batchSize = 50;
    
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${batch.join(',')}&key=${apiKey}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('YouTube API Error Response:', errorText);
          throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.items) {
          console.warn('No items in response:', data);
          continue;
        }

        const batchVideos = data.items.map((item: YouTubeApiItem) => ({
            id: item.id,
            title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          url: `https://www.youtube.com/watch?v=${item.id}`,
          viewCount: parseInt(item.statistics.viewCount),
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
          previousViewCount: parseInt(item.statistics.viewCount),
          viewCountIncrease: 0,
          lastUpdated: new Date().toISOString()
          }));
          
        videos.push(...batchVideos);
      } catch (error) {
        console.error('Error fetching video batch:', error);
        throw error;
      }
    }
    
    if (videos.length === 0) {
      throw new Error('No videos were successfully fetched');
    }

    // Instrumentalを含む動画を除外
    const filteredVideos = videos.filter((video: YouTubeVideo) => !video.title.toLowerCase().includes('instrumental'));
    console.log(`Total videos after filtering instrumental versions: ${filteredVideos.length}`);

    return filteredVideos;
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
      // 最終更新時間を取得
      const { lastFetchTime, lastStatsUpdateTime } = await getLastUpdateTime();
      const now = new Date();
      const lastFetch = new Date(lastFetchTime);
      const lastStats = lastStatsUpdateTime ? new Date(lastStatsUpdateTime) : null;

      // 12時間経過しているかチェック
      const hoursSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60);
      const hoursSinceLastStats = lastStats ? (now.getTime() - lastStats.getTime()) / (1000 * 60 * 60) : 24;

      // データベースから現在のデータを取得
      const { data: currentStats, error: fetchError } = await supabase
        .from('video_stats')
        .select('*')
        .order('view_count', { ascending: false });

      if (fetchError) {
        console.error('Error fetching current stats:', fetchError);
        throw fetchError;
      }

      // 12時間経過していない場合は、現在のデータを返す
      if (hoursSinceLastFetch < 12 && currentStats && currentStats.length > 0) {
        console.log('Using cached data (less than 12 hours old)');
        // データベースのデータに動画の詳細情報を追加
        const videosWithDetails = await Promise.all(
          currentStats.map(async (stat: any) => {
            const videoDetails = await getVideosDetails([stat.video_id]);
            const details = videoDetails[0] || {};
            return {
              id: stat.video_id,
              title: stat.title,
              viewCount: stat.view_count,
              previousViewCount: stat.previous_view_count,
              viewCountIncrease: stat.view_count_increase,
              lastUpdated: stat.last_updated,
              thumbnail: details.thumbnail,
              url: details.url,
              publishedAt: details.publishedAt,
              channelTitle: details.channelTitle
            };
          })
        );
        return {
          videos: videosWithDetails,
          lastUpdated: lastFetch.toISOString()
        };
      }

      console.log('Fetching fresh data from API');
      
      // プレイリストから動画を取得
      const playlistVideoIds = await getVideoIdsFromPlaylist(HATSUHOSHI_MUSIC_PLAYLIST_ID);
      console.log(`Total videos found: ${playlistVideoIds.length}`);
      
      // 動画の詳細情報を取得
      const videos = await getVideosDetails(playlistVideoIds);
      
      // 再生回数でソート（確実に降順になるように）
      const sortedVideos = [...videos].sort((a, b) => {
        const viewCountA = typeof a.viewCount === 'number' ? a.viewCount : 0;
        const viewCountB = typeof b.viewCount === 'number' ? b.viewCount : 0;
        return viewCountB - viewCountA;
      });

      // 24時間経過している場合は、前回の再生数と比較して増加量を計算
      if (hoursSinceLastStats >= 24 && currentStats) {
        const updatedVideos = sortedVideos.map(video => {
          const previousStats = currentStats.find(stat => stat.video_id === video.id);
          const previousViewCount = previousStats ? previousStats.view_count : video.viewCount;
          const viewCountIncrease = video.viewCount - previousViewCount;

          return {
            ...video,
            previousViewCount,
            viewCountIncrease
          };
        });

        // データベースを更新（再生回数の降順で保存）
        const { error: updateError } = await supabase
          .from('video_stats')
          .upsert(
            updatedVideos.map(video => ({
              video_id: video.id,
              title: video.title,
              view_count: video.viewCount,
              previous_view_count: video.previousViewCount,
              view_count_increase: video.viewCountIncrease,
              last_updated: now.toISOString()
            }))
          );

        if (updateError) {
          console.error('Error updating video stats:', updateError);
          throw updateError;
        }

        // 統計更新時間を更新
        await updateLastStatsTime();
      } else {
        // 通常の更新（再生回数の降順で保存）
        const { error: updateError } = await supabase
          .from('video_stats')
          .upsert(
            sortedVideos.map(video => ({
              video_id: video.id,
              title: video.title,
              view_count: video.viewCount,
              previous_view_count: video.viewCount,
              view_count_increase: 0,
              last_updated: now.toISOString()
            }))
          );

        if (updateError) {
          console.error('Error updating video stats:', updateError);
          throw updateError;
        }
      }

      // 最終取得時間を更新
      await updateLastFetchTime();
      
      return {
        videos: sortedVideos,
        lastUpdated: now.toISOString()
      };
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  }

  // チャンネルIDから動画情報を取得
  export const getVideosFromChannel = async (channelId: string): Promise<YouTubeVideo[]> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=100&type=video`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos from channel');
      }

      const data = await response.json();
      console.log(`Found ${data.items.length} videos in channel (limited to 100)`);

      // 動画IDのリストを作成
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');

      // 動画の詳細情報を取得
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${process.env.YOUTUBE_API_KEY}&id=${videoIds}&part=statistics`
      );

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch video statistics');
      }

      const statsData = await statsResponse.json();

      // 動画情報を結合
      const videos = data.items.map((item: any, index: number) => {
        const stats = statsData.items[index];
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          viewCount: parseInt(stats.statistics.viewCount)
        };
      });

      // Instrumentalを含む動画を除外
      const filteredVideos = videos.filter((video: YouTubeVideo) => !video.title.toLowerCase().includes('instrumental'));
      console.log(`Total videos after filtering instrumental versions: ${filteredVideos.length}`);

      return filteredVideos;
    } catch (error) {
      console.error('Error fetching videos from channel:', error);
      throw error;
    }
  };

  // プレイリストIDから動画情報を取得
  export const getVideosFromPlaylist = async (playlistId: string): Promise<YouTubeVideo[]> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?key=${process.env.YOUTUBE_API_KEY}&playlistId=${playlistId}&part=snippet&maxResults=50`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos from playlist');
      }

      const data = await response.json();
      console.log(`Found ${data.items.length} videos in playlist (limited to 50)`);

      // 動画IDのリストを作成
      const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      // 動画の詳細情報を取得
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${process.env.YOUTUBE_API_KEY}&id=${videoIds}&part=statistics`
      );

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch video statistics');
      }

      const statsData = await statsResponse.json();

      // 動画情報を結合
      const videos = data.items.map((item: any, index: number) => {
        const stats = statsData.items[index];
        return {
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          viewCount: parseInt(stats.statistics.viewCount)
        };
      });

      // Instrumentalを含む動画を除外
      const filteredVideos = videos.filter((video: YouTubeVideo) => !video.title.toLowerCase().includes('Instrumental'));
      console.log(`Total videos after filtering instrumental versions: ${filteredVideos.length}`);

      return filteredVideos;
    } catch (error) {
      console.error('Error fetching videos from playlist:', error);
      throw error;
    }
  };