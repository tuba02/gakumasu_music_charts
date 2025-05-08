import { createClient } from '@supabase/supabase-js';
import { YouTubeVideo } from '@/app/types';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// データベースのスキーマを定義
const schema = `
-- 動画統計テーブル
CREATE TABLE IF NOT EXISTS video_stats (
  video_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  view_count INTEGER NOT NULL,
  previous_view_count INTEGER,
  increase INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 最終更新時間テーブル
CREATE TABLE IF NOT EXISTS last_update (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_fetch_time TIMESTAMP WITH TIME ZONE NOT NULL,
  last_stats_update_time TIMESTAMP WITH TIME ZONE
);

-- 初期データの挿入（last_updateテーブル用）
INSERT INTO last_update (id, last_fetch_time, last_stats_update_time)
VALUES (1, NOW(), NULL)
ON CONFLICT (id) DO NOTHING;
`;

// データベースの初期化
export const initDatabase = async () => {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    if (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// 最終更新時間を取得
export const getLastUpdateTime = async () => {
  try {
    const { data, error } = await supabase
      .from('last_update')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching last update time:', error);
      throw error;
    }

    return {
      lastFetchTime: data.last_fetch_time,
      lastStatsUpdateTime: data.last_stats_update_time
    };
  } catch (error) {
    console.error('Failed to get last update time:', error);
    throw error;
  }
};

// 最終更新時間を更新
export const updateLastFetchTime = async () => {
  try {
    const { error } = await supabase
      .from('last_update')
      .update({ last_fetch_time: new Date().toISOString() })
      .eq('id', 1);

    if (error) {
      console.error('Error updating last fetch time:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update last fetch time:', error);
    throw error;
  }
};

// 統計更新時間を更新
export const updateLastStatsTime = async () => {
  try {
    const { error } = await supabase
      .from('last_update')
      .update({ last_stats_update_time: new Date().toISOString() })
      .eq('id', 1);

    if (error) {
      console.error('Error updating last stats time:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update last stats time:', error);
    throw error;
  }
};

// 動画の統計情報を保存
export const saveVideoStats = async (videos: Omit<YouTubeVideo, 'previousViewCount' | 'viewCountIncrease'>[]) => {
  try {
    // Instrumentalを含む動画を除外
    const filteredVideos = videos.filter(video => !video.title.toLowerCase().includes('instrumental'));

    for (const video of filteredVideos) {
      const { data: existingVideo, error: selectError } = await supabase
        .from('video_stats')
        .select('view_count')
        .eq('video_id', video.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116は「データが見つからない」エラー
        console.error('Error fetching existing video:', selectError);
        throw selectError;
      }

      const previousViewCount = existingVideo?.view_count || 0;
      const increase = video.viewCount - previousViewCount;

      const { error: upsertError } = await supabase
        .from('video_stats')
        .upsert({
          video_id: video.id,
          title: video.title,
          view_count: video.viewCount,
          previous_view_count: previousViewCount,
          increase: increase,
          last_updated: new Date().toISOString()
        });

      if (upsertError) {
        console.error('Error upserting video:', upsertError);
        throw upsertError;
      }
    }

    console.log(`Saved stats for ${filteredVideos.length} videos (excluding instrumental versions)`);
  } catch (error) {
    console.error('Failed to save video stats:', error instanceof Error ? error.message : error);
    throw error;
  }
};

// 動画の統計情報を取得
export const getVideoStats = async (videoId: string) => {
  try {
    const { data, error } = await supabase
      .from('video_stats')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (error) {
      console.error('Error fetching video stats:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Failed to get video stats:', error instanceof Error ? error.message : error);
    throw error;
  }
};

// 全動画の統計情報を取得
export const getAllVideoStats = async () => {
  try {
    const { data, error } = await supabase
      .from('video_stats')
      .select('*')
      .order('view_count', { ascending: false });

    if (error) {
      console.error('Error fetching all video stats:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Failed to get all video stats:', error instanceof Error ? error.message : error);
    throw error;
  }
};

// 24時間の再生数増加量ランキングを取得
export const getViewCountIncreaseRanking = async () => {
  try {
    const { data, error } = await supabase
      .from('video_stats')
      .select(`
        video_id,
        title,
        view_count,
        previous_view_count,
        last_updated
      `)
      .gte('last_updated', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching view count increase ranking:', error);
      throw error;
    }

    // 増加量を計算してソート
    return data
      .map(row => ({
        ...row,
        increase: row.view_count - row.previous_view_count
      }))
      .sort((a, b) => b.increase - a.increase);
  } catch (error) {
    console.error('Failed to get view count increase ranking:', error instanceof Error ? error.message : error);
    throw error;
  }
};

// データベース接続を閉じる
export const closeDatabase = async () => {
  try {
    await supabase.auth.signOut();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Failed to close database connection:', error);
    throw error;
  }
}; 