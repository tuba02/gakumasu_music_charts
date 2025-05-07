import { NextResponse } from 'next/server';
import { getVideoIdsFromChannel, getVideosDetails } from '@/app/lib/youtube';
import { HATSUHOSHI_CHANNEL_ID } from '@/app/types';

export const dynamic = 'force-dynamic';
export const revalidate = 12 * 3600; // 12時間ごとに再検証

export async function GET() {
  try {
    // チャンネルから動画IDを取得
    const videoIds = await getVideoIdsFromChannel(HATSUHOSHI_CHANNEL_ID);
    
    if (!videoIds || videoIds.length === 0) {
      console.error('No video IDs found');
      return NextResponse.json(
        { error: '動画が見つかりませんでした' },
        { status: 404 }
      );
    }

    // 動画の詳細情報を取得
    const videos = await getVideosDetails(videoIds);
    
    if (!videos || videos.length === 0) {
      console.error('No video details found');
      return NextResponse.json(
        { error: '動画の詳細情報を取得できませんでした' },
        { status: 404 }
      );
    }

    // 再生回数でソート
    const sortedVideos = videos.sort((a, b) => b.viewCount - a.viewCount);

    return NextResponse.json(sortedVideos);
  } catch (error) {
    console.error('Error in YouTube API:', error);
    
    // エラーの種類に応じて適切なステータスコードを返す
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'YouTube APIキーが設定されていません' },
          { status: 500 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'YouTube APIのクォータ制限に達しました' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'YouTube APIからのデータ取得に失敗しました' },
      { status: 500 }
    );
  }
} 