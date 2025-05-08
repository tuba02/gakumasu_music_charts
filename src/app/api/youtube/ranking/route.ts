import { NextResponse } from 'next/server';
import { getHatsuhoshiVideosRanking } from '@/app/lib/youtube';
import { getLastUpdateTime, getViewCountIncreaseRanking, supabase } from '@/app/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 12 * 3600; // 12時間ごとに再検証

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (!force) {
      const { data: { lastFetchTime } } = await getLastUpdateTime();
      const now = new Date();
      const lastFetch = new Date(lastFetchTime);
      
      // 日付が変わっているかチェック
      const isNewDay = lastFetch.getDate() !== now.getDate() || 
                      lastFetch.getMonth() !== now.getMonth() || 
                      lastFetch.getFullYear() !== now.getFullYear();
      
      // 12時間経過しているか、または日付が変わっている場合は新しいデータを取得
      const hoursSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60);
      
      if (false){// hoursSinceLastFetch < 12 && !isNewDay) {
        // キャッシュを使用
        const { data: currentStats } = await supabase
          .from('video_stats')
          .select('*')
          .order('view_count', { ascending: false });

        const { data: increaseStats } = await supabase
          .from('video_stats')
          .select('*')
          .order('view_count_increase', { ascending: false });

        // データベースのデータをYouTubeVideoの形式に変換
        const formattedVideos = currentStats?.map(stat => ({
          id: stat.video_id,
          title: stat.title,
          viewCount: stat.view_count,
          previousViewCount: stat.previous_view_count,
          viewCountIncrease: stat.view_count_increase,
          lastUpdated: stat.last_updated,
          thumbnail: `https://img.youtube.com/vi/${stat.video_id}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${stat.video_id}`,
          publishedAt: stat.published_at,
          channelTitle: '初星学園'
        })) || [];

        const formattedIncreaseRanking = increaseStats?.map(stat => ({
          id: stat.video_id,
          title: stat.title,
          viewCount: stat.view_count,
          previousViewCount: stat.previous_view_count,
          viewCountIncrease: stat.view_count_increase,
          lastUpdated: stat.last_updated,
          thumbnail: `https://img.youtube.com/vi/${stat.video_id}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${stat.video_id}`,
          publishedAt: stat.published_at,
          channelTitle: '初星学園'
        })) || [];

        return NextResponse.json({
          videos: formattedVideos,
          increaseRanking: formattedIncreaseRanking,
          lastUpdated: lastFetch.toISOString()
        });
      }
    }

    // 新しいデータを取得
    const { videos, lastUpdated } = await getHatsuhoshiVideosRanking();
    const increaseRanking = await getViewCountIncreaseRanking();
    
    return NextResponse.json({
      videos,
      increaseRanking,
      lastUpdated
    });
  } catch (error) {
    console.error('Error in ranking API:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'YouTube APIキーが設定されていません。.env.localファイルを確認してください。' },
          { status: 500 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'YouTube APIのクォータ制限に達しました。しばらく待ってから再試行してください。' },
          { status: 429 }
        );
      }
    }
    return NextResponse.json(
      { error: '動画情報の取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 