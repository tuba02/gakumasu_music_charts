import { NextResponse } from 'next/server';
import { getHatsuhoshiVideosRanking } from '@/app/lib/youtube';
import { saveVideoStats, getViewCountIncreaseRanking } from '@/app/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 12 * 3600; // 12時間ごとに再検証

export async function GET() {
  try {
    // はつ星の動画情報を取得
    const { videos } = await getHatsuhoshiVideosRanking();
    
    // 動画の統計情報を保存
    await saveVideoStats(videos);
    
    // 24時間の再生数増加量ランキングを取得
    const increaseRanking = await getViewCountIncreaseRanking();
    
    return NextResponse.json({
      videos,
      increaseRanking,
      lastUpdated: new Date().toISOString()
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