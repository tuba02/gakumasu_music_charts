import { createClient } from '@supabase/supabase-js';
import { YouTubeVideo } from '@/app/types';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 最終更新時間を取得
 */
export const getLastUpdateTime = async () => {
  try {
    const { data, error } = await supabase
      .from('video_stats')
      .select('last_updated')
      .order('last_updated', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last update time:', error);
      throw error;
    }

    return {
      data: {
        lastFetchTime: data[0]?.last_updated || new Date().toISOString(),
        lastStatsUpdateTime: data[0]?.last_updated || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in getLastUpdateTime:', error);
    throw error;
  }
};

/**
 * 再生回数増加率のランキングを取得
 */
export const getViewCountIncreaseRanking = async () => {
  try {
    const { data, error } = await supabase
      .from('video_stats')
      .select(`
        video_id,
        title,
        view_count,
        previous_view_count,
        view_count_increase,
        last_updated
      `)
      .gte('last_updated', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching view count increase ranking:', error);
      throw error;
    }

    // 増加量でソート
    return data.sort((a, b) => b.view_count_increase - a.view_count_increase);
  } catch (error) {
    console.error('Failed to get view count increase ranking:', error instanceof Error ? error.message : error);
    throw error;
  }
};

/**
 * 動画の統計情報を保存
 */
export const saveVideoStats = async (videos: YouTubeVideo[]) => {
  try {
    const now = new Date().toISOString();
    
    // 既存のデータを取得
    const { data: existingStats } = await supabase
      .from('video_stats')
      .select('*');
    
    

    // 更新データの作成
    const updateData = videos.map(video => {
      const existingVideo = existingStats?.find(stat => stat.video_id === video.id);
      const update = {
        video_id: video.id,
        title: video.title,
        view_count: video.viewCount,
        previous_view_count: existingVideo ? existingVideo.view_count : video.viewCount,
        view_count_increase: existingVideo ? video.viewCount - existingVideo.view_count : 0,
        last_updated: now,
        published_at: existingVideo?.published_at || video.publishedAt
      };
      return update;
    });

    // データベースを更新
    const { error: updateError } = await supabase
      .from('video_stats')
      .upsert(updateData);

    if (updateError) {
      console.error('Error updating video stats:', updateError);
      throw updateError;
    }

    return updateData;
  } catch (error) {
    console.error('Error saving video stats:', error);
    throw error;
  }
};